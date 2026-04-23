package com.animalfarm.backend.global.exception;

import java.util.HashMap;
import java.util.Map;
import java.util.SimpleTimeZone;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.animalfarm.backend.global.dto.ApiResponseDTO;
import com.animalfarm.backend.global.dto.ExternalApiResponseDTO;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

	private final ObjectMapper objectMapper;

	// 커스텀 에러 처리
	@ExceptionHandler(BusinessException.class)
	public ResponseEntity<ApiResponseDTO<Void>> handleBusinessException(BusinessException e) {
		return ResponseEntity
			.status(e.getHttpStatus())
			.body(ApiResponseDTO.fail(e.getCode(), e.getMessage()));
	}

	// 강황증권 API 에러 처리
	@ExceptionHandler(ExternalApiException.class)
	public ResponseEntity<?> handleExternalApiException(ExternalApiException e) {
		int statusCode = e.getStatusCode();
		String errorBody = e.getErrorBody();

		// 1. 외부 응답에서 메시지 추출
		String message = "서비스 이용 중 오류가 발생했습니다.";

		try {
			ExternalApiResponseDTO<?> error = objectMapper.readValue(errorBody, ExternalApiResponseDTO.class);

			if (error.getMessage() != null && !error.getMessage().isBlank()) {
				message = error.getMessage();
			}

		} catch (Exception ex) {
			log.warn("API 응답 메시지 파싱 실패: {}", errorBody);
		}

		// 2. 상태 코드에 따라 에러 코드 매핑
		ErrorCode errorCode;
		if (statusCode == 404) {
			errorCode = ErrorCode.EXTERNAL_API_NOTFOUND;
		} else {
			errorCode = ErrorCode.EXTERNAL_API_ERROR;
		}

		return ResponseEntity
			.status(e.getStatusCode())
			.body(ApiResponseDTO.fail(errorCode.getCode(), message)); // 외부 API 응답에서 추출한 메시지 전달
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponseDTO<Void>> handleException(Exception e) {
		log.error("[Unexpected System Error] ", e);

		return ResponseEntity
			.status(HttpStatus.INTERNAL_SERVER_ERROR)
			.body(ApiResponseDTO.fail(ErrorCode.INTERNAL_SERVER_ERROR.getCode(), ErrorCode.INTERNAL_SERVER_ERROR.getMessage()));
	}

	private String extractMessage(String errorBody) {
		if (errorBody == null || errorBody.isEmpty()) {
			return "서비스 오류가 발생했습니다.";
		}

		try {
			// ObjectMapper를 사용하여 ApiResponse 구조로 파싱 시도
			ExternalApiResponseDTO<?> apiResponse = objectMapper.readValue(errorBody, ExternalApiResponseDTO.class);
			return apiResponse.getMessage();
		} catch (Exception parseException) {
			// JSON 파싱 실패 시 문자열 패턴 매칭 시도
			if (errorBody.contains("\"message\":\"")) {
				try {
					return errorBody.split("\"message\":\"")[1].split("\"")[0];
				} catch (Exception e) {
					return errorBody;
				}
			}
			return errorBody;
		}
	}

	private String cleanMessage(String message) {
		if (message == null)
			return "알 수 없는 오류가 발생했습니다.";

		String cleaned = message;

		// "ERROR:" 키워드 이후의 메시지만 추출
		if (cleaned.contains("ERROR:")) {
			String[] parts = cleaned.split("ERROR:");
			cleaned = parts[parts.length - 1];
		}

		// 줄바꿈 제거, 따옴표 제거, 앞뒤 공백 제거
		return cleaned.split("\n")[0]
			.replace("\"", "")
			.trim();
	}
}
