package com.animalfarm.backend.domain.user.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.animalfarm.backend.domain.user.dto.EmailSendRequestDTO;
import com.animalfarm.backend.domain.user.dto.EmailVerifyRequestDTO;
import com.animalfarm.backend.domain.user.dto.EnterpriseVerifyRequestDTO;
import com.animalfarm.backend.domain.user.dto.EnterpriseVerifyResponseDTO;
import com.animalfarm.backend.domain.user.dto.LoginRequestDTO;
import com.animalfarm.backend.domain.user.dto.PasswordResetRequestDTO;
import com.animalfarm.backend.domain.user.dto.SignUpRequestDTO;
import com.animalfarm.backend.domain.user.dto.TokenResponseDTO;
import com.animalfarm.backend.domain.user.service.AuthService;
import com.animalfarm.backend.domain.user.service.EnterpriseAuthService;
import com.animalfarm.backend.domain.user.service.UserEmailService;
import com.animalfarm.backend.global.dto.ApiResponseDTO;
import com.animalfarm.backend.global.exception.ErrorCode;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "AuthController", description = "로그인 및 토큰 관리 API")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

	@Autowired
	private AuthService authService;

	@Autowired
	private EnterpriseAuthService enterpriseAuthService;

	@Autowired
	private UserEmailService userEmailService;

	@PostMapping("/login")
	@Operation(summary = "사용자 로그인", description = "이메일과 비밀번호를 받아 JWT 토큰을 발급")
	public ResponseEntity<ApiResponseDTO<TokenResponseDTO>> login(
		@Parameter(description = "로그인 정보", required = true)
		@RequestBody LoginRequestDTO loginRequest) {

		try {
			log.info("로그인 요청: {}", loginRequest.getEmail());

			TokenResponseDTO tokenResponse = authService.login(loginRequest);

			return ResponseEntity.ok(
				ApiResponseDTO.success(tokenResponse, "로그인 성공")
			);

		} catch (Exception e) {
			log.error("로그인 실패: {}", e.getMessage(), e);

			return ResponseEntity
				.status(ErrorCode.INVALID_PASSWORD.getHttpStatus())
				.body(ApiResponseDTO.fail(
					ErrorCode.INVALID_PASSWORD.getCode(),
					ErrorCode.INVALID_PASSWORD.getMessage()
				));
		}
	}

	@PostMapping("/refresh")
	@Operation(summary = "토큰 재발급", description = "Refresh Token을 이용하여 새로운 Access Token과 Refresh Token을 발급")
	public ResponseEntity<ApiResponseDTO<Map<String, String>>> refresh(
		@RequestBody Map<String, String> requestBody) {
		try {
			String oldRefreshToken = requestBody.get("refreshToken");

			if (!StringUtils.hasText(oldRefreshToken)) {
				return ResponseEntity
					.status(ErrorCode.INVALID_REFRESH_TOKEN.getHttpStatus())
					.body(ApiResponseDTO.fail(
						ErrorCode.INVALID_REFRESH_TOKEN.getCode(),
						ErrorCode.INVALID_REFRESH_TOKEN.getMessage()
					));
			}

			Map<String, String> newTokens = authService.refresh(oldRefreshToken);

			return ResponseEntity.ok(
				ApiResponseDTO.success(newTokens, "토큰이 재발급되었습니다.")
			);

		} catch (Exception e) {
			log.error("토큰 재발급 실패: {}", e.getMessage(), e);

			return ResponseEntity
				.status(ErrorCode.TOKEN_EXPIRED.getHttpStatus())
				.body(ApiResponseDTO.fail(
					ErrorCode.TOKEN_EXPIRED.getCode(),
					ErrorCode.TOKEN_EXPIRED.getMessage()
				));
		}
	}

	@PostMapping(value = "/logout")
	@Operation(summary = "로그아웃", description = "리프레시 토큰을 삭제하고 엑세스 토큰을 블랙리스트에 등록")
	public ResponseEntity<ApiResponseDTO<Void>> logout(HttpServletRequest request) {
		try {
			String bearerToken = request.getHeader("Authorization");

			if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
				String accessToken = bearerToken.substring(7);
				authService.logout(accessToken);

				return ResponseEntity.ok(
					ApiResponseDTO.success(null, "정상적으로 로그아웃되었습니다.")
				);
			}

			return ResponseEntity
				.status(ErrorCode.INVALID_LOGOUT_REQUEST.getHttpStatus())
				.body(ApiResponseDTO.fail(
					ErrorCode.INVALID_LOGOUT_REQUEST.getCode(),
					ErrorCode.INVALID_LOGOUT_REQUEST.getMessage()
				));

		} catch (Exception e) {
			log.error("로그아웃 실패: {}", e.getMessage(), e);

			return ResponseEntity
				.status(ErrorCode.LOGOUT_FAILED.getHttpStatus())
				.body(ApiResponseDTO.fail(
					ErrorCode.LOGOUT_FAILED.getCode(),
					ErrorCode.LOGOUT_FAILED.getMessage()
				));
		}
	}

	@PostMapping(value = "/signup")
	@Operation(summary = "회원가입", description = "사용자 회원가입을 진행")
	public ResponseEntity<ApiResponseDTO<Void>> signup(
		@RequestBody SignUpRequestDTO signupRequest) {
		try {
			authService.signUp(signupRequest);
			return ResponseEntity.ok(ApiResponseDTO.success(null, "회원가입이 완료되었습니다."));
		} catch (Exception e) {
			log.error("회원가입 실패 : {}", e.getMessage(), e);

			return ResponseEntity.status(ErrorCode.DUPLICATE_EMAIL.getHttpStatus())
				.body(ApiResponseDTO.fail(ErrorCode.DUPLICATE_EMAIL.getCode(), ErrorCode.DUPLICATE_EMAIL.getMessage()));
		}
	}

	@PostMapping(value = "/enterprise/verification")
	public ResponseEntity<ApiResponseDTO<EnterpriseVerifyResponseDTO>> verify(
		@RequestBody EnterpriseVerifyRequestDTO req) {
		try {
			EnterpriseVerifyResponseDTO result = enterpriseAuthService.verify(req);
			return ResponseEntity.ok(ApiResponseDTO.success(result, "기업 인증 성공"));
		} catch (Exception e) {
			log.error("기업 인증 실패 : {}", e.getMessage(), e);
			return ResponseEntity.status(ErrorCode.EXTERNAL_API_ERROR.getHttpStatus())
				.body(ApiResponseDTO.fail(ErrorCode.EXTERNAL_API_ERROR.getCode(),
					ErrorCode.EXTERNAL_API_ERROR.getMessage()));
		}
	}

	@PostMapping(value = "/email/verification")
	public ResponseEntity<ApiResponseDTO<Void>> sendVerificationCode(
		@RequestBody EmailSendRequestDTO request) {
		try {
			String email = request.getEmail();

			if (userEmailService.isDuplicateEmail(email)) {
				return ResponseEntity.status(ErrorCode.DUPLICATE_EMAIL.getHttpStatus())
					.body(ApiResponseDTO.fail(ErrorCode.DUPLICATE_EMAIL.getCode(),
						ErrorCode.DUPLICATE_EMAIL.getMessage()));
			}
			userEmailService.sendCode(email);

			return ResponseEntity.ok(ApiResponseDTO.success(null, "이메일 코드 발송 완료"));
		} catch (Exception e) {
			log.error("이메일 코드 발송 실패 : {}", e.getMessage(), e);

			return ResponseEntity.status(ErrorCode.INTERNAL_SERVER_ERROR.getHttpStatus())
				.body(ApiResponseDTO.fail(ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
					ErrorCode.INTERNAL_SERVER_ERROR.getMessage()));
		}
	}

	@PostMapping(value = "/email/verification/confirmation")
	public ResponseEntity<ApiResponseDTO<Void>> confirmVerificationCode(
		@RequestBody EmailVerifyRequestDTO request) {
		try {
			boolean ok = userEmailService.verifyCode(request.getEmail(), request.getCode());
			if (!ok) {
				return ResponseEntity.status(ErrorCode.INTERNAL_SERVER_ERROR.getHttpStatus())
					.body(ApiResponseDTO.fail(ErrorCode.INVALID_AUTH_CODE.getCode(),
						ErrorCode.INVALID_AUTH_CODE.getMessage()));
			}

			return ResponseEntity.ok(ApiResponseDTO.success(null, "이메일 인증 성공"));
		} catch (Exception e) {
			log.error("이메일 인증 확인 실패 : {}", e.getMessage(), e);

			return ResponseEntity.status(ErrorCode.INTERNAL_SERVER_ERROR.getHttpStatus())
				.body(ApiResponseDTO.fail(ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
					ErrorCode.INTERNAL_SERVER_ERROR.getMessage()));
		}

	}
	@PostMapping(value = "/password/reset/code")
	public ResponseEntity<ApiResponseDTO<Void>> sendPasswordResetCode(
		@RequestBody EmailSendRequestDTO request) {
		try {
			String email = request.getEmail();

			if (!userEmailService.isDuplicateEmail(email)) {
				return ResponseEntity.status(ErrorCode.USER_NOT_FOUND.getHttpStatus())
					.body(ApiResponseDTO.fail(ErrorCode.USER_NOT_FOUND.getCode(),
						ErrorCode.USER_NOT_FOUND.getMessage()));
			}

			userEmailService.sendCode(email);

			return ResponseEntity.ok(ApiResponseDTO.success(null, "비밀번호 재설정 코드 발송 완료"));
		} catch (Exception e) {
			log.error("비밀번호 재설정 코드 발송 실패 : {}", e.getMessage(), e);

			return ResponseEntity.status(ErrorCode.INTERNAL_SERVER_ERROR.getHttpStatus())
				.body(ApiResponseDTO.fail(ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
						ErrorCode.INTERNAL_SERVER_ERROR.getMessage()));
		}
	}

	@PostMapping(value = "/password/reset/verify")
	public ResponseEntity<ApiResponseDTO<Void>> verifyPasswordResetCode(
		@RequestBody EmailVerifyRequestDTO request) {
		try {
			boolean ok = userEmailService.verifyCode(request.getEmail(), request.getCode(), false);
			if (!ok) {
				return ResponseEntity.status(ErrorCode.INVALID_AUTH_CODE.getHttpStatus())
					.body(ApiResponseDTO.fail(ErrorCode.INVALID_AUTH_CODE.getCode(),
						ErrorCode.INVALID_AUTH_CODE.getMessage()));
			}

			return ResponseEntity.ok(ApiResponseDTO.success(null, "인증 코드 확인 완료"));
		} catch (Exception e) {
			log.error("비밀번호 재설정 인증 확인 실패 : {}", e.getMessage(), e);

			return ResponseEntity.status(ErrorCode.INTERNAL_SERVER_ERROR.getHttpStatus())
				.body(ApiResponseDTO.fail(ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
						ErrorCode.INTERNAL_SERVER_ERROR.getMessage()));
		}
	}

	@PostMapping(value = "/password/reset")
	public ResponseEntity<ApiResponseDTO<Void>> resetPassword(
		@RequestBody PasswordResetRequestDTO request) {
		try {
			authService.resetPassword(request.getEmail(), request.getVerificationCode(),
				request.getNewPassword(), request.getConfirmPassword());

			return ResponseEntity.ok(ApiResponseDTO.success(null, "비밀번호가 변경되었습니다."));
		} catch (IllegalArgumentException e) {
			log.error("비밀번호 재설정 실패 : {}", e.getMessage(), e);
			return ResponseEntity.status(ErrorCode.INTERNAL_SERVER_ERROR.getHttpStatus())
				.body(ApiResponseDTO.fail(ErrorCode.INTERNAL_SERVER_ERROR.getCode(), e.getMessage()));
		} catch (Exception e) {
			log.error("비밀번호 재설정 실패 : {}", e.getMessage(), e);

			return ResponseEntity.status(ErrorCode.INTERNAL_SERVER_ERROR.getHttpStatus())
				.body(ApiResponseDTO.fail(ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
						ErrorCode.INTERNAL_SERVER_ERROR.getMessage()));
		}
	}}