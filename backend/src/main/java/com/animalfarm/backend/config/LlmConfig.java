package com.animalfarm.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class LlmConfig {

	@Value("${openai.api.connect-timeout}")
	private int connectTimeout;

	@Value("${openai.api.read-timeout}")
	private int readTimeout;

	@Bean
	public RestTemplate llmRestTemplate() {
		SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
		factory.setConnectTimeout(connectTimeout);
		factory.setReadTimeout(readTimeout);

		return new RestTemplate(factory);
	}
}
