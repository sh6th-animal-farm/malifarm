package com.animalfarm.backend.global.security;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.animalfarm.backend.global.JwtProvider;
import com.animalfarm.backend.global.RedisUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * [JWT 인증 필터]
 * - 모든 HTTP 요청을 가로채서 헤더의 JWT 유효성을 검증합니다.
 * - Redis를 조회해 로그아웃 여부를 확인한 뒤 인증된 사용자에게만 접근을 허용합니다.
 */
@Slf4j
@RequiredArgsConstructor
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtProvider jwtProvider;
	private final RedisUtil redisUtil;

	// application.yml에 등록한 암구호 주입
	@Value("${app.internal.secret}")
	private String internalSecret;

	// public void handle(HttpServletRequest request, HttpServletResponse response,
	// 	AccessDeniedException accessDeniedException) throws IOException, ServletException {
	//
	// 	log.warn("권한 부족 접근: {}", accessDeniedException.getMessage());
	//
	// 	response.setContentType("application/json;charset=UTF-8");
	// 	response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
	//
	// 	// 프론트에서 이 메시지를 띄워줄 겁니다.
	// 	response.getWriter().println("{ \"error\": \"403\", \"message\": \"기업 회원만 이용 가능한 서비스입니다.\" }");
	// }

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
		throws ServletException, IOException {
		// =========================================================================
		// 1. [AI 봇 전용 프리패스] 내부 서버 간 통신 확인 (JWT 검증 생략)
		// =========================================================================
		String requestSecret = request.getHeader("X-Internal-Secret");

		if (StringUtils.hasText(internalSecret) && internalSecret.equals(requestSecret)) {
			String botIdStr = request.getHeader("X-Bot-Id"); // ex) "24"
			String botRole = request.getHeader("X-Bot-Role"); // ex) "MARKET_MAKER" 또는 "AI_BOT"

			if (botIdStr != null && botRole != null) {
				Long botId = Long.parseLong(botIdStr);

				// ROLE_ 접두사 처리 (CustomUser 생성 로직과 맞추기 위함)
				String roleName = botRole.startsWith("ROLE_") ? botRole.substring(5) : botRole;
				List<GrantedAuthority> authorities = Collections.singletonList(
					new SimpleGrantedAuthority("ROLE_" + roleName));

				// ⭐️ 핵심: SecurityUtil.getCurrentUserId()에서 에러가 나지 않도록 CustomUser 객체로 신분증 생성!
				CustomUser botUser = new CustomUser(
					"bot_" + botId, // username(email) 자리에 더미값 주입
					"", // password
					authorities,
					botId,
					roleName
				);

				Authentication auth = new UsernamePasswordAuthenticationToken(botUser, null, authorities);
				SecurityContextHolder.getContext().setAuthentication(auth);

				log.info("🤖 내부 봇 인증 프리패스 통과: ID={}, Role={}", botId, roleName);

				// JWT 로직 타지 않고 바로 다음 필터로 직행!
				filterChain.doFilter(request, response);
				return;
			}
		}

		// =========================================================================
		// 2. [일반 유저 로그인] 기존 JWT 검증 로직 (수정 없이 그대로 사용)
		// =========================================================================

		// 1. [토큰 추출] Authorization 헤더에서 토큰을 꺼내옵니다.
		String token = resolveToken(request);

		// 2. [검증 단계] 토큰이 존재하고 서명이 유효한지 확인합니다.
		// [수정 포인트] 토큰이 존재할 때의 검증 로직을 강화합니다.
		if (token != null) {
			if (jwtProvider.validateToken(token)) {
				if (!redisUtil.isBlackList(token)) {
					Authentication auth = jwtProvider.getAuthentication(token);
					SecurityContextHolder.getContext().setAuthentication(auth);
					log.info("인증 성공: {}", auth.getName());
				} else {
					log.warn("블랙리스트에 등록된 토큰입니다.");
					SecurityContextHolder.clearContext(); // 컨텍스트를 비워 인증되지 않은 상태로 만듦
				}
			} else {
				// [중요] 토큰은 있으나 validateToken이 false(만료 등)인 경우
				// 여기서 명확하게 컨텍스트를 비워야 EntryPoint(401)가 작동합니다.
				log.warn("유효하지 않거나 만료된 토큰입니다.");
				SecurityContextHolder.clearContext();
			}
		}

		// 5. [필터 통과] 여기서 에러를 직접 던지지 말고 다음 필터로 넘깁니다.
		filterChain.doFilter(request, response);
	}

	/**
	 * [헤더 파싱] "Bearer "를 제외한 순수 토큰값만 추출합니다.
	 */
	private String resolveToken(HttpServletRequest request) {
		// 1. 요청 헤더에서 "Authorization" 항목의 값을 가져옵니다.
		String bearerToken = request.getHeader("Authorization");

		// 2. 가져온 값이 비어있지 않은지, 그리고 "Bearer "로 시작하는지 확인합니다.
		if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
			// 3. 앞의 "Bearer " (7글자)를 잘라내고 순수 JWT만 반환합니다.
			return bearerToken.substring(7);
		}

		// 4. 조건에 맞지 않으면 토큰이 없는 것으로 간주하고 null을 반환합니다.
		return null;
	}
}
