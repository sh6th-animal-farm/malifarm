package com.animalfarm.backend.domain.subscription;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.animalfarm.backend.domain.subscription.dto.SubscriptionApplicationDTO;
import com.animalfarm.backend.global.dto.ApiResponseDTO;
import com.animalfarm.backend.global.exception.BusinessException;
import com.animalfarm.backend.global.exception.ErrorCode;
import com.animalfarm.backend.global.security.SecurityUtil;

import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/subscription")
public class SubscriptionController {

	@Autowired
	SubscriptionService subscriptionService;

	@PostMapping("/cancel")
	public ResponseEntity<ApiResponseDTO<String>> cancelSubscription(@RequestBody
	Long projectId) {
		try {
			boolean isSuccess = subscriptionService.selectAndCancel(projectId);
			if (isSuccess) {
				return ResponseEntity.ok(ApiResponseDTO.success("success", "청약 취소가 완료되었습니다."));
			} else {
				return ResponseEntity.ok(ApiResponseDTO.success("api_fail", "청약은 취소되었으나 외부 시스템 반영에 실패했습니다."));
			}
		} catch (Exception e) {
			return ResponseEntity
				.status(ErrorCode.INTERNAL_SERVER_ERROR.getHttpStatus())
				.body(ApiResponseDTO.fail(
					ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
					"청약 취소 처리 중 서버 오류가 발생했습니다."
				));
		}
	}

	@PostMapping("/application")
	public ResponseEntity<ApiResponseDTO<String>> applicationSubscription(
		@RequestBody SubscriptionApplicationDTO subscriptionInsertDTO) {
		Long userId = SecurityUtil.getCurrentUserId();
		if (userId == null) {
			throw new BusinessException(ErrorCode.NEED_LOGIN);
		}
		subscriptionInsertDTO.setUserId(userId);
		if (subscriptionService.subscriptionApplication(subscriptionInsertDTO)) {
			try {
				subscriptionService.postApplication(subscriptionInsertDTO);
				return ResponseEntity.ok(ApiResponseDTO.success("success", "청약 신청이 완료되었습니다."));
			} catch (Exception e) {
				log.error("증권사 전송 중 오류 발생: {}", e.getMessage());
				String status = "empty_payload".equals(e.getMessage()) ? "empty_payload" : "api_fail";
				return ResponseEntity.ok(ApiResponseDTO.success(status, "청약은 접수되었으나 증권사 전송에 실패했습니다."));
			}
		} else {
			return ResponseEntity
				.status(ErrorCode.INTERNAL_SERVER_ERROR.getHttpStatus())
				.body(ApiResponseDTO.fail(
					ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
					"청약 처리 중 서버 오류가 발생했습니다."
				));
		}
	}

	@GetMapping("/check/{projectId}")
	@Operation(summary = "청약 여부 조회", description = "상세 페이지 진입 시 사용자의 청약 여부를 반환합니다.")
	public ResponseEntity<ApiResponseDTO<Map<String, Object>>> checkSubscriptionStatus(@PathVariable Long projectId) {
		Map<String, Object> data = new HashMap<>();
		boolean isApplied = subscriptionService.checkUserApplied(projectId);
		data.put("isApplied", isApplied);
		return ResponseEntity.ok(ApiResponseDTO.success(data, "상태 조회 성공"));
	}
}
