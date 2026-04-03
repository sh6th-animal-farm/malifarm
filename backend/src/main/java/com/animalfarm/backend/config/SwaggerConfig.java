package com.animalfarm.backend.config;

import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.parameters.HeaderParameter;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class SwaggerConfig {

	@Bean
	public OpenAPI openAPI() {

		// 1. 보안 스키마 정의 (JWT 방식)
		SecurityScheme apiKey = new SecurityScheme()
			.type(SecurityScheme.Type.HTTP)
			.scheme("bearer")
			.bearerFormat("JWT")
			.in(SecurityScheme.In.HEADER)
			.name("Authorization");

		// 2. 모든 경로에 대해 보안 설정을 적용
		SecurityRequirement securityRequirement = new SecurityRequirement().addList("JWT");

		return new OpenAPI()
			.components(new Components().addSecuritySchemes("JWT", apiKey))
			.addSecurityItem(securityRequirement);
	}

	// 2. [새로 추가] 봇 테스트용 커스텀 헤더 4개 추가
	@Bean
	public OperationCustomizer addBotHeadersCustomizer() {
		return (operation, handlerMethod) -> {

			// 필수(required)를 false로 두어야, 일반 유저들이 스웨거 테스트할 때 에러가 나지 않습니다.
			operation.addParametersItem(new HeaderParameter()
				.name("X-Internal-Secret")
				.description("🤖 [봇 전용] 내부 암구호 (테스트용)")
				.required(false));

			operation.addParametersItem(new HeaderParameter()
				.name("X-Bot-Id")
				.description("🤖 [봇 전용] 봇 PK (예: 24)")
				.required(false));

			operation.addParametersItem(new HeaderParameter()
				.name("X-Bot-Role")
				.description("🤖 [봇 전용] 권한 (MARKET_MAKER 또는 AI_BOT)")
				.required(false));

			return operation;
		};
	}
}
