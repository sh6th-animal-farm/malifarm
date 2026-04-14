package com.animalfarm.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.animalfarm.backend.global.JwtProvider;
import com.animalfarm.backend.global.RedisUtil;
import com.animalfarm.backend.global.security.JwtAccessDeniedHandler;
import com.animalfarm.backend.global.security.JwtAuthenticationEntryPoint;
import com.animalfarm.backend.global.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final JwtProvider jwtProvider;
	private final RedisUtil redisUtil;
	private final JwtAuthenticationEntryPoint entryPoint;
	private final JwtAccessDeniedHandler accessDeniedHandler;
	private final JwtAuthenticationFilter jwtAuthenticationFilter;

	@Bean
	public WebSecurityCustomizer webSecurityCustomizer() {
		// 정적 리소스 및 Swagger v3 경로는 필터를 거치지 않도록 설정 (성능 최적화)
		return (web) -> web.ignoring()
			.requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/swagger-resources/**", "/v3/api-docs/**",
				"/v3/api-docs", "/webjars/**", "/api/swagger-ui/**", "/api/swagger-ui.html", "/api/v3/api-docs/**",
				"/resources/**", "/favicon.ico", "/error");
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
			// 1. CSRF 및 세션 관리 (Stateless 환경 설정)
			.csrf(csrf -> csrf.disable())
			.httpBasic(httpBasic -> httpBasic.disable())
			.formLogin(formLogin -> formLogin.disable())
			.cors(cors -> cors.configurationSource(corsConfigurationSource()))
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

			// 2. API 접근 권한 제어
			.authorizeHttpRequests(auth -> auth
				// [Public] 로그인 없이 접근 가능한 경로
				.requestMatchers("/api/auth/**", "/", "/main", "/auth/**", "/policy", "/notice/list")
				.permitAll()
				.requestMatchers("/project/**", "/token/**", "/token", "/mypage/**", "/market/**")
				.permitAll()
				.requestMatchers("/api/auth/**", "/api/project/**", "/api/token/**")
				.permitAll()

				// [Read-Only] GET 요청에 대해 전역 허용
				.requestMatchers(HttpMethod.GET, "/api/project/**", "/api/token/**", "/api/token",
					"/api/accounts/**", "/api/market/**", "/api/home/project")
				.permitAll()

				// [Role: ADMIN] 관리자 전용 기능
				.requestMatchers("/admin", "/admin/**")
				.hasRole("ADMIN")
				.requestMatchers("/api/admin/**")
				.hasRole("ADMIN")
				.requestMatchers("/api/project/insert", "/api/project/update")
				.hasRole("ADMIN")
				.requestMatchers(HttpMethod.DELETE, "/api/project/picture/**")
				.hasRole("ADMIN")

				// [Role: ENTERPRISE] 기업 회원 전용 (탄소 마켓)
				.requestMatchers("/api/carbon/**", "/carbon/**")
				.hasRole("ENTERPRISE")

				//  AI 봇과 일반 유저 모두 주문 API에 접근할 수 있도록 권한 확장
				.requestMatchers("/api/token/order/**", "/api/token/order-cancel/**")
				.hasAnyRole("USER", "ENTERPRISE", "AI_BOT", "MARKET_MAKER")

				// [Authenticated] 로그인 필수 액션
				.requestMatchers("/api/project/subscription", "/api/project/favorite", "/api/project/favorite/**",
					"/api/project/confirm-user")
				.authenticated()
				.requestMatchers("/api/mypage/**")
				.authenticated()

				// 그 외 모든 요청은 인증 필요
				.anyRequest()
				.authenticated()
			)

			// 3. 예외 처리 및 커스텀 필터 등록
			.exceptionHandling(exception -> exception
				.authenticationEntryPoint(entryPoint) // 401 Unauthorized
				.accessDeniedHandler(accessDeniedHandler) // 403 Forbidden
			)
			// new 키워드 대신 주입받은 빈(jwtAuthenticationFilter)을 등록!
			.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		// 프론트엔드 도메인 허용
		configuration.setAllowedOrigins(
			List.of("https://mlfarm.3jun.store", "http://localhost:9999", "http://localhost:5173", "https://malifarm.site", "https://www.malifarm.site"));
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("*"));
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
