package com.animalfarm.backend.domain.chatbot;

import java.security.Principal;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.animalfarm.backend.domain.chatbot.dto.ChatRequestDTO;
import com.animalfarm.backend.domain.chatbot.dto.ChatResponseDTO;
import com.animalfarm.backend.global.dto.ApiResponseDTO;
import com.animalfarm.backend.global.security.SecurityUtil;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chatbot")
public class ChatbotController {

	private final ChatbotService chatbotService;

	@PostMapping("/messages")
	public ResponseEntity<ApiResponseDTO<ChatResponseDTO>> sendMessage(
		@Valid @RequestBody ChatRequestDTO request,
		Principal principal) {

		String userKey = resolveUserKey(principal);
		ChatResponseDTO response = chatbotService.ask(request, userKey);
		return ResponseEntity.ok(ApiResponseDTO.success(response));
	}

	private String resolveUserKey(Principal principal) {
		try {
			Long userId = SecurityUtil.getCurrentUserId();
			if (userId != null) {
				return "malifarm-user-" + userId;
			}
		} catch (Exception ignored) {
		}

		if (principal != null && principal.getName() != null && !principal.getName().isBlank()) {
			return "malifarm-user-" + principal.getName();
		}

		return "malifarm-guest";
	}
}
