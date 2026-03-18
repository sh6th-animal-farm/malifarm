package com.animalfarm.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	// private final JwtProvider jwtProvider;
	// private final RedisUtil redisUtil;
	// private final JwtAuthenticationEntryPoint entryPoint;
	// private final JwtAccessDeniedHandler accessDeniedHandler;

	@Bean
	public WebSecurityCustomizer webSecurityCustomizer() {
		// 정적 리소스 및 Swagger v3 경로는 필터를 거치지 않도록 설정 (성능 최적화)
		return (web) -> web.ignoring()
			.requestMatchers("/swagger-ui/**", "/swagger-resources/**", "/v3/api-docs/**", "/webjars/**",
				"/resources/**", "/favicon.ico", "/error");
	}

	/*
	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
			// 1. CSRF 및 세션 관리 (Stateless 환경 설정)
			.csrf(AbstractHttpConfigurer::disable)
			.httpBasic(AbstractHttpConfigurer::disable)
			.formLogin(AbstractHttpConfigurer::disable)
			.cors(cors -> cors.configurationSource(corsConfigurationSource()))
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

			// 2. API 접근 권한 제어 (기존 authorizeRequests -> authorizeHttpRequests)
			.authorizeHttpRequests(auth -> auth
				// [Public] 로그인 없이 접근 가능한 경로
				.requestMatchers("/api/auth/**", "/", "/main", "/auth/**", "/policy", "/notice/list").permitAll()
				.requestMatchers("/project/**", "/token/**", "/token", "/carbon/**", "/mypage/**", "/market/**").permitAll()
				.requestMatchers("/admin", "/admin/**").permitAll()

				// [Read-Only] GET 요청에 대해 전역 허용
				.requestMatchers(HttpMethod.GET, "/api/project/**", "/api/token/**", "/api/token", "/api/accounts/**", "/api/market/**").permitAll()

				// [Role: ADMIN] 관리자 전용 기능
				.requestMatchers("/api/admin/**").hasRole("ADMIN")
				.requestMatchers("/api/project/insert", "/api/project/update").hasRole("ADMIN")
				.requestMatchers(HttpMethod.DELETE, "/api/project/picture/**").hasRole("ADMIN")

				// [Role: ENTERPRISE] 기업 회원 전용 (탄소 마켓)
				.requestMatchers("/api/carbon/**").hasRole("ENTERPRISE")

				// [Authenticated] 로그인 필수 액션 (청약, 좋아요, 주문 등)
				.requestMatchers("/api/project/subscription", "/api/project/favorite", "/api/project/favorite/**", "/api/project/confirm-user").authenticated()
				.requestMatchers("/api/token/order/**", "/api/token/order-cancel/**").authenticated()
				.requestMatchers("/api/mypage/**").authenticated()

				// 그 외 모든 요청은 인증 필요
				.anyRequest().authenticated()
			)

			// 3. 예외 처리 및 커스텀 필터 등록
			.exceptionHandling(exception -> exception
				.authenticationEntryPoint(entryPoint) // 401 Unauthorized
				.accessDeniedHandler(accessDeniedHandler) // 403 Forbidden
			)
			// UsernamePasswordAuthenticationFilter 실행 전 JWT 필터 먼저 수행
			.addFilterBefore(new JwtAuthenticationFilter(jwtProvider, redisUtil), UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
	*/

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		// 프론트엔드 도메인 허용
		configuration.setAllowedOrigins(
			List.of("https://mlfarm.3jun.store", "http://localhost:9999", "http://localhost:5173"));
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("*"));
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	/*
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	*/
}
