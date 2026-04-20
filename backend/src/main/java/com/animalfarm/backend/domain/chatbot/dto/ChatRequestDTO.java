package com.animalfarm.backend.domain.chatbot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRequestDTO {

	@NotBlank(message = "질문은 비어 있을 수 없습니다.")
	@Size(max = 2000, message = "질문은 2000자를 초과할 수 없습니다.")
	private String message;

	@Size(max = 200, message = "대화 ID 형식이 올바르지 않습니다.")
	private String conversationId;
}
