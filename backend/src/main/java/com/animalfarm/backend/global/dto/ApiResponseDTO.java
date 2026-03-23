package com.animalfarm.backend.global.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponseDTO<T> {

	private boolean success; // 성공 여부
	private T data;          // 데이터
	private String message;  // 메시지
	private ApiError error;  // 에러 정보 (코드, 상세 등)

	// 1. 성공 - 데이터 O, 메시지 X
	public static <T> ApiResponseDTO<T> success(T data) {
		return new ApiResponseDTO<>(true, data, null, null);
	}

	// 2. 성공 - 데이터 O, 메시지 O
	public static <T> ApiResponseDTO<T> success(T data, String message) {
		return new ApiResponseDTO<>(true, data, message, null);
	}

	// 3. 실패 - 메시지 O, 에러 정보 O (코드)
	public static <T> ApiResponseDTO<T> fail(String errorCode, String message) {
		return new ApiResponseDTO<>(false, null, message, new ApiError(errorCode));
	}

	// 4. 실패 - 메시지 O, 에러 정보 O (코드, 상세)
	public static <T> ApiResponseDTO<T> fail(String errorCode, String message, Object details) {
		return new ApiResponseDTO<>(false, null, message, new ApiError(errorCode, details));
	}

	@Getter
	@AllArgsConstructor(access = AccessLevel.PRIVATE)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	public static class ApiError {
		private String code;    // 커스텀 에러 코드 (예: AUTH_001)
		private Object details; // 에러 상세 내용 (예: 로그인 정보 만료)

		private ApiError(String code) {
			this.code = code;
		}
	}
}
