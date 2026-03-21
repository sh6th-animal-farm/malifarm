package com.animalfarm.backend.global.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ExternalApiResponseDTO<T> {

	private String message;
	private T payload;
}
