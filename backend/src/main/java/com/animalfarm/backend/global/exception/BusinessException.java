package com.animalfarm.backend.global.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
	private final String code;
	private final HttpStatus httpStatus;

	// 1. 미리 정의된 ErrorCode(ENUM) 사용
	public BusinessException(ErrorCode errorCode) {
		super(errorCode.getMessage());
		this.code = errorCode.getCode();
		this.httpStatus = errorCode.getHttpStatus();
	}

	// 2. 정의되지 않은 에러 사용
	public BusinessException(HttpStatus httpStatus, String code, String message) {
		super(message);
		this.httpStatus = httpStatus;
		this.code = code;
	}
}
