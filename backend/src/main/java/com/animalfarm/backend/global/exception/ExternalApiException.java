package com.animalfarm.backend.global.exception;

import lombok.Getter;

@Getter
public class ExternalApiException extends RuntimeException {

	private final int statusCode;
	private final String errorBody;

	public ExternalApiException(int statusCode, String errorBody) {
		super("외부 API 호출 중 오류 발생");
		this.statusCode = statusCode;
		this.errorBody = errorBody;
	}
}
