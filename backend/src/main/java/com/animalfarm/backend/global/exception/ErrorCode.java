package com.animalfarm.backend.global.exception;

import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

	/*
	 ** 에러 코드 필요에 따라 정의
	 */

	// 사용자 관련 에러
	USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_001", "사용자를 찾을 수 없습니다."),
	DUPLICATE_EMAIL(HttpStatus.BAD_REQUEST, "USER_002", "이미 존재하는 이메일입니다."),

	// 인증 관련 에러
	INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "AUTH_001", "비밀번호가 일치하지 않습니다."),
	NEED_LOGIN(HttpStatus.UNAUTHORIZED, "AUTH_002", "로그인이 필요한 서비스입니다."),
	TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "AUTH_003", "로그인 정보가 만료되었습니다. 다시 로그인해주세요."),
	INVALID_REFRESH_TOKEN(HttpStatus.BAD_REQUEST, "AUTH_004", "리프레시 토큰이 없습니다."),
	INVALID_LOGOUT_REQUEST(HttpStatus.BAD_REQUEST, "AUTH_005", "잘못된 로그아웃 요청입니다."),
	LOGOUT_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "AUTH_006", "로그아웃 처리 중 오류가 발생했습니다."),
	INVALID_AUTH_CODE(HttpStatus.UNAUTHORIZED, "AUTH_007", "이메일 인증 코드가 올바르지 않습니다."),
	ACCESS_DENIED(HttpStatus.FORBIDDEN, "AUTH_008", "접근 권한이 없습니다."),

	// 시스템 에러
	INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "COMMON_001", "서버 내부 오류가 발생했습니다."),

	// 외부 API 연동 에러
	EXTERNAL_API_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "EXTERNAL_001", "외부 서비스 연동 중 오류가 발생했습니다."),
	EXTERNAL_API_TIMEOUT(HttpStatus.GATEWAY_TIMEOUT, "EXTERNAL_002", "외부 서비스 응답 시간이 초과되었습니다."),
	EXTERNAL_API_PARSING_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "EXTERNAL_003", "외부 서비스 데이터 해석에 실패했습니다."),

	// 계좌 연동
	EXTERNAL_API_ACC_EXIST(HttpStatus.BAD_REQUEST, "EXTERNAL_004", "이미 연동된 회원입니다."),
	EXTERNAL_API_ACC_NOT_FOUND(HttpStatus.BAD_REQUEST, "EXTERNAL_005", "연동 가능한 강황증권 계좌를 찾을 수 없습니다."),

	// 프로젝트 에러
	PROJECT_NOT_FOUND(HttpStatus.NOT_FOUND, "PROJECT_001", "존재하지 않는 프로젝트입니다."),
	STARRED_PROCESS_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "PROJECT_002", "관심 프로젝트 처리 중 오류가 발생했습니다."),
	PROJECT_LIST_FETCH_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "PROJECT_003", "프로젝트 목록을 불러오는 중 오류가 발생했습니다."),

	// 청약 신청 에러
	INSUFFICIENT_BALANCE(HttpStatus.BAD_REQUEST, "PAY-001", "증권 계좌 잔액이 부족합니다."),

	// 뉴스 에러
	NEWS_NOT_FOUND(HttpStatus.NOT_FOUND, "NEWS_001", "해당 뉴스를 찾을 수 없습니다.");

	private final HttpStatus httpStatus;
	private final String code;
	private final String message;
}
