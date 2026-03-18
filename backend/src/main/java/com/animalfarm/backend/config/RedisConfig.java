package com.animalfarm.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

	@Bean
	public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {

		// 1. 연결팩토리 주입 (DI)
		RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
		redisTemplate.setConnectionFactory(connectionFactory);

		// 2. 직렬화 (Serializer)
		redisTemplate.setKeySerializer(new StringRedisSerializer()); // 문자열 형태로 저장
		redisTemplate.setValueSerializer(new GenericJackson2JsonRedisSerializer()); // JSON 형태로 저장

		return redisTemplate;
	}
}
