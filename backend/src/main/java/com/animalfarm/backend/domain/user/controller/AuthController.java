package com.animalfarm.backend.domain.user.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.animalfarm.backend.domain.user.dto.LoginRequestDTO;
import com.animalfarm.backend.domain.user.dto.TokenResponseDTO;
import com.animalfarm.backend.domain.user.service.AuthService;
import com.animalfarm.backend.global.dto.ApiResponseDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "User Authentication API", description = "로그인 및 토큰 관리 API")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

	private final AuthService authService; // @Autowired 대신 final 사용 권장

	/**
	 * [1. 로그인 API]
	 * @param loginRequest 이메일과 비밀번호
	 * @return Access Token(60분) 및 Refresh Token(30일)
	 */
	@PostMapping("/login")
	@Operation(summary = "사용자 로그인", description = "이메일과 비밀번호를 받아 JWT 토큰을 발급합니다.")
	public ResponseEntity<ApiResponseDTO<TokenResponseDTO>> login(
		@Parameter(description = "로그인 정보", required = true)
		@RequestBody LoginRequestDTO loginRequest) {

		try {
			log.info("로그인 요청: {}", loginRequest.getEmail());
			// 1-1. 서비스 계층에 로그인 요청 위임
			TokenResponseDTO tokenResponse = authService.login(loginRequest);
			// 1-2. 성공 시 200 OK와 함께 토큰 전송
			return ResponseEntity.ok(ApiResponseDTO.success(tokenResponse, "로그인 성공"));
		} catch (Exception e) {
			log.error("로그인 실패: {}", e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(ApiResponseDTO.fail("AUTH_001", "이메일 또는 비밀번호가 틀렸습니다."));
		}
	}

	/**
	 * [2. 토큰 재발급 API]
	 * - 만료된 Access Token을 갱신하기 위해 사용합니다.
	 * @param requestBody 클라이언트가 보낸 JSON { "refreshToken": "..." }
	 */
	@PostMapping("/refresh")
	@Operation(summary = "토큰 재발급", description = "Refresh Token을 이용하여 새로운 Access Token과 Refresh Token을 발급받습니다.")
	public ResponseEntity<ApiResponseDTO<Map<String, String>>> refresh(
		@RequestBody Map<String, String> requestBody) {
		try {
			String oldRefreshToken = requestBody.get("refreshToken");

			if (!StringUtils.hasText(oldRefreshToken)) {
				return ResponseEntity.badRequest().body(ApiResponseDTO.fail("AUTH_004", "리프레시 토큰이 없습니다."));
			}
			// 2-1. 서비스 계층에서 Redis 검증 후 AT, RT가 담긴 Map을 받아옴
			Map<String, String> newTokens = authService.refresh(oldRefreshToken);
			// 2-2. 결과를 그대로 응답 (JSON에 AT와 RT가 모두 포함됨)
			return ResponseEntity.ok(ApiResponseDTO.success(newTokens, "토큰이 재발급되었습니다."));
		} catch (Exception e) {
			log.error("토큰 재발급 실패: {}", e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(ApiResponseDTO.fail("AUTH_003", "세션이 만료되었습니다. 다시 로그인해주세요."));
		}

	}

	/**
	 * [3. 로그아웃 API]
	 * - 사용자의 세션을 종료하고 토큰을 무효화합니다.
	 * - Access Token을 블랙리스트에 등록하고 Redis에서 RT를 삭제합니다.
	 */
	@PostMapping(value = "/logout", produces = "application/json; charset=UTF-8")
	@Operation(summary = "로그아웃", description = "리프레시 토큰을 삭제하고 엑세스 토큰을 블랙리스트에 등록합니다.")
	public ResponseEntity<ApiResponseDTO<Void>> logout(HttpServletRequest request) {
		try {
			// 3-1. HTTP 헤더에서 Authorization (Bearer Token) 추출
			String bearerToken = request.getHeader("Authorization");

			if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
				String accessToken = bearerToken.substring(7);
				// 3-2. 서비스 계층에서 Redis 데이터 처리 (RT 삭제 및 AT 블랙리스트)
				authService.logout(accessToken);
				return ResponseEntity.ok(ApiResponseDTO.success(null, "정상적으로 로그아웃되었습니다."));
			}
			return ResponseEntity.badRequest().body(ApiResponseDTO.fail("AUTH_005", "잘못된 로그아웃 요청입니다."));
		} catch (Exception e) {
			log.error("로그아웃 실패: {}", e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(ApiResponseDTO.fail("AUTH_999", "로그아웃 처리 중 오류가 발생했습니다."));
		}
	}

}
