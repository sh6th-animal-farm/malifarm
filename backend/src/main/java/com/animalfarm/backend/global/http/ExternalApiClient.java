package com.animalfarm.backend.global.http;

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

	// 강황증권 API 호출 메서드 - 멱등성 키 X
	public <T> T callApi(String url, HttpMethod method, Object body,
		ParameterizedTypeReference<ExternalApiResponseDTO<T>> responseType) {
		return callApi(url, method, body, responseType, null);
	}

	// 강황증권 API 호출 메서드 - 멱등성 키 O
	public <T> T callApi(String url, HttpMethod method, Object body,
		ParameterizedTypeReference<ExternalApiResponseDTO<T>> responseType, String idempotencyKey) {

		// 1. 요청 준비 (Request Spec 설정)
		WebClient.RequestBodySpec requestSpec = webClient.method(method)
			.uri(url)
			.headers(headers -> {
				headers.setContentType(MediaType.APPLICATION_JSON);
				if (idempotencyKey != null && !idempotencyKey.isEmpty()) {
					headers.set("X-Idempotency-Key", idempotencyKey);
				}
			});

		// 2. 바디 설정 (null이면 세팅 안 함)
		if (body != null) {
			requestSpec.bodyValue(body);
		}

		// 3. 요청 전송 및 응답 처리
		ExternalApiResponseDTO<T> response = requestSpec
			.retrieve()
			.onStatus(HttpStatusCode::isError, clientResponse ->
				clientResponse.bodyToMono(String.class)
					.flatMap(errorBody -> Mono.error(new ExternalApiException(
						clientResponse.statusCode().value(),
						errorBody
					)))
			)
			.bodyToMono(responseType) // 응답값을 responseType 형태로 변환
			.block(); // 동기

		if (response == null) {
			throw new RuntimeException("API 응답이 비어있습니다.");
		}

		log.info("[API Success] URL: {}, Msg: {}", url, response.getMessage());
		return response.getPayload();
	}
}
