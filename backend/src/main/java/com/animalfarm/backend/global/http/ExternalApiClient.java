package com.animalfarm.backend.global.http;

import java.util.Map;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import com.animalfarm.backend.global.dto.ExternalApiResponseDTO;
import com.animalfarm.backend.global.exception.ExternalApiException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExternalApiClient {

	private final WebClient webClient;

	/* 강황증권 API 호출 메서드
	 **
	 */

	// 헤더 X
	public <T> T callApi(String url, HttpMethod method, Object body,
		ParameterizedTypeReference<ExternalApiResponseDTO<T>> responseType) {
		return callApi(url, method, body, responseType, null);
	}

	/*
	// 헤더 O (멱등성 키)
	public <T> T callApi(String url, HttpMethod method, Object body,
		ParameterizedTypeReference<ExternalApiResponseDTO<T>> responseType, String idempotencyKey) {

		// 멱등성 키가 있다면 헤더에 추가
		Map<String, String> headers = new HashMap<>();
		if (idempotencyKey != null && !idempotencyKey.isEmpty()) {
			headers.put("X-Idempotency-Key", idempotencyKey);
		}

		// 공통 메서드 호출
		return callApi(url, method, body, responseType, headers);
	}
	 */

	// 헤더 O (멱등성 키 포함)
	public <T> T callApi(String url, HttpMethod method, Object body,
		ParameterizedTypeReference<ExternalApiResponseDTO<T>> responseType, Map<String, String> customHeaders) {

		// 1. 요청 준비 (WebClient 방식)
		WebClient.RequestBodySpec requestSpec = webClient.method(method)
			.uri(url)
			.headers(headers -> {
				headers.setContentType(MediaType.APPLICATION_JSON);
				// 기존의 Map 헤더들을 WebClient 헤더에 주입
				if (customHeaders != null) {
					customHeaders.forEach(headers::set);
				}
			});

		// 2. 바디 설정
		if (body != null) {
			requestSpec.bodyValue(body);
		}

		// 3. 실행 및 예외 처리
		try {
			// 3. 요청 전송 및 응답 처리
			ExternalApiResponseDTO<T> response = requestSpec
				.retrieve()
				// API 응답 에러 처리 (4xx, 5xx)
				.onStatus(HttpStatusCode::isError, clientResponse ->
					clientResponse.bodyToMono(String.class)
						.flatMap(errorBody -> {
							log.error("[External API Fail] Status: {}, Body: {}", clientResponse.statusCode(),
								errorBody);
							return Mono.error(new ExternalApiException(
								clientResponse.statusCode().value(),
								errorBody
							));
						})
				)
				.bodyToMono(responseType) // 응답값을 responseType 형태로 변환
				.block(); // 동기식으로 결과 대기

			if (response == null) {
				throw new RuntimeException("API 응답이 비어있습니다.");
			}

			log.info("[External API Success] URL: {}, Msg: {}", url, response.getMessage());
			return response.getPayload();

		} catch (ExternalApiException e) {
			// 비즈니스 에러는 그대로 던짐
			throw e;
		} catch (Exception e) {
			// 시스템 에러(타임아웃, 접속 불가 등) 처리
			log.error("[External API System Error] URL: {}, Message: {}", url, e.getMessage());
			throw new RuntimeException("외부 서비스 호출 중 시스템 오류가 발생했습니다.", e);
		}
	}

	// 껍데기(ExternalApiResponseDTO) 없이 직접 데이터를 받는 메서드
	public <T> T callRawApi(String url, HttpMethod method, ParameterizedTypeReference<T> responseType) {
		try {
			String secureUrl = url.replace("http://", "https://");
			return webClient.method(method)
				.uri(java.net.URI.create(secureUrl))
				.header("User-Agent", "Mozilla/5.0")
				.retrieve()
				.bodyToMono(responseType)
				.block();

		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}
}
