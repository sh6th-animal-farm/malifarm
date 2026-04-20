package com.animalfarm.backend.domain.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChatResponseDTO {

	private String answer;
	private String conversationId;
}
