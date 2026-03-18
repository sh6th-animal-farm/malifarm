package com.animalfarm.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
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
}
