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

		// 1. 에러 메시지 추출
		String extractedMessage = extractMessage(errorBody);

		// 2. 에러 메시지 정제
		String finalMessage = cleanMessage(extractedMessage);

		// 3. 에러 메시지 반환
		Map<String, String> responseBody = new HashMap<>();
		responseBody.put("message", finalMessage);

		return ResponseEntity
			.status(e.getStatusCode())
			.body(responseBody);
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
