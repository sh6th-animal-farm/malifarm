package com.animalfarm.backend.config;

import java.time.Duration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import reactor.netty.http.client.HttpClient;

@Configuration
public class WebClientConfig {

	@Bean
	public WebClient webClient() {

		// 통신 세부 설정
		HttpClient httpClient = HttpClient.create()
			.option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)              // 연결 타임아웃 5초
			.responseTimeout(Duration.ofSeconds(30))                         // 응답 타임아웃 30초
			.doOnConnected(conn -> conn
				.addHandlerLast(new ReadTimeoutHandler(30))    // 읽기 타임아웃 30초
				.addHandlerLast(new WriteTimeoutHandler(30))); // 쓰기 타임아웃 30초

		return WebClient.builder()
			.clientConnector(new ReactorClientHttpConnector(httpClient))
			.codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024)) // 2MB
			.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
			.build();
	}
}
