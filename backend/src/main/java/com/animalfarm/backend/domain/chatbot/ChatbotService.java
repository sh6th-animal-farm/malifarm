package com.animalfarm.backend.domain.chatbot;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.animalfarm.backend.domain.chatbot.dto.ChatRequestDTO;
import com.animalfarm.backend.domain.chatbot.dto.ChatResponseDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatbotService {

	private static final String FALLBACK_ERROR_MESSAGE = "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

	private final RestTemplate llmRestTemplate;
	private final ObjectMapper objectMapper;

	@Value("${dify.api.base-url:}")
	private String difyApiBaseUrl;

	@Value("${dify.api.key:}")
	private String difyApiKey;

	public ChatResponseDTO ask(ChatRequestDTO request, String userKey) {
		if (difyApiBaseUrl.isBlank() || difyApiKey.isBlank()) {
			log.error("[CHATBOT] Dify 설정 누락(base-url/api-key)");
			return new ChatResponseDTO(FALLBACK_ERROR_MESSAGE, normalizeConversationId(request.getConversationId()));
		}

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		headers.setBearerAuth(difyApiKey);

		Map<String, Object> body = new HashMap<>();
		body.put("query", request.getMessage());
		body.put("inputs", Map.of());
		body.put("response_mode", "blocking");
		body.put("user", userKey);
		body.put("conversation_id", normalizeConversationId(request.getConversationId()));

		String endpoint = normalizeBaseUrl(difyApiBaseUrl) + "/chat-messages";

		try {
			HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
			ResponseEntity<String> response = llmRestTemplate.postForEntity(endpoint, entity, String.class);
			JsonNode root = objectMapper.readTree(response.getBody());

			String answer = root.path("answer").asText("");
			String conversationId = root.path("conversation_id").asText(normalizeConversationId(request.getConversationId()));

			if (answer.isBlank()) {
				log.warn("[CHATBOT] Dify 응답 answer 비어있음");
				return new ChatResponseDTO(FALLBACK_ERROR_MESSAGE, conversationId);
			}

			return new ChatResponseDTO(answer, conversationId);
		} catch (Exception e) {
			log.error("[CHATBOT] Dify 호출 실패: {}", e.getMessage(), e);
			return new ChatResponseDTO(FALLBACK_ERROR_MESSAGE, normalizeConversationId(request.getConversationId()));
		}
	}

	private String normalizeBaseUrl(String rawUrl) {
		String trimmed = rawUrl.trim();
		return trimmed.endsWith("/") ? trimmed.substring(0, trimmed.length() - 1) : trimmed;
	}

	private String normalizeConversationId(String conversationId) {
		return conversationId == null ? "" : conversationId.trim();
	}
}
