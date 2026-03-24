package com.animalfarm.backend.domain.retry;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.animalfarm.backend.global.dto.ExternalApiResponseDTO;
import com.animalfarm.backend.global.http.ExternalApiClient;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ApiRetryProcessor {
	private final ExternalApiClient externalApiUtil;
	private final ApiRetryQueueRepository apiRetryQueueMapper;
	private final ObjectMapper objectMapper;
	private final ApiRetryService apiRetryService;

	@Value("${api.kh-stock.url}")
	private String KH_BASE_URL;

	/**
	 * 실제 API 재호출 실행
	 */
	@Async("retryExecutor")
	public void executeRetry(ApiRetryQueueDTO retry, ApiRetryService service) {
		// 중복 실행 방지를 위해 상태를 PROCESSING으로 변경

		retry.setStatus("PROCESSING");
		apiRetryQueueMapper.updateStatus(retry);
		String idempotencyKey = retry.getIdempotencyKey();

		try {
			// DB의 문자열 타입을 다시 Enum 타입으로 복구
			ApiType type = ApiType.valueOf(retry.getApiType());

			// 파라미터 재생성해서 붙임
			Object[] params = objectMapper.readValue(retry.getQuery(), Object[].class);
			String fullUrl = KH_BASE_URL + type.getFullUri(params);

			Map<String, String> headers = new HashMap<>();
			headers.put("X-Idempotency-Key", idempotencyKey);

			// 외부 API 호출 (멱등성 키 포함)
			Object response = externalApiUtil.callApi(
				fullUrl,
				type.getMethod(),
				retry.getPayload(),
				new ParameterizedTypeReference<ExternalApiResponseDTO<Object>>() {},
				headers
			);

			// 성공 시 완료 처리
			retry.setStatus("COMPLETED");
			apiRetryQueueMapper.updateStatus(retry);
			log.info("재시도 성공했습니다. Key: {}", idempotencyKey);

			apiRetryService.afterRetrySuccess(retry, response);

		} catch (Exception e) {
			// 실패
			log.warn("재시도 실패했습니다. Key: {}, 사유: {}", idempotencyKey, e.getMessage());
			service.handleFailure(retry);
		}
	}
}
