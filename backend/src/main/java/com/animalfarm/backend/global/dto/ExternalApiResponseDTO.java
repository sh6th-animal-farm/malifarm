package com.animalfarm.backend.global.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ExternalApiResponseDTO<T> {

	private String message;
	private T payload;
}
