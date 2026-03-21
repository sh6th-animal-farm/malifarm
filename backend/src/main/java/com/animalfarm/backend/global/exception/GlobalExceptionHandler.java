package com.animalfarm.backend.global.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.animalfarm.backend.global.dto.ExternalApiResponseDTO;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

	private final ObjectMapper objectMapper;

	// 강황증권 API 에러 처리
	@ExceptionHandler(ExternalApiException.class)
	public ResponseEntity<?> handleExternalApiException(ExternalApiException e) {
		int statusCode = e.getStatusCode();
		String errorBody = e.getErrorBody();
		log.error("[External API Fail] Status: {}, Body: {}", statusCode, errorBody);

		String message = "문제가 발생했습니다. 다시 시도해주세요";
		try {
			ExternalApiResponseDTO<?> error = objectMapper.readValue(errorBody, ExternalApiResponseDTO.class);

			if (error.getMessage() != null && !error.getMessage().isBlank()) {
				message = error.getMessage();
			}

		} catch (Exception ex) {
			log.warn("API 응답 메시지 파싱 실패: {}", errorBody);
		}

		throw new RuntimeException(message);
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
