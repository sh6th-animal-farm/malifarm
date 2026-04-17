package com.animalfarm.backend.domain.user.service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.animalfarm.backend.domain.user.repository.UserRepository;
import com.animalfarm.backend.global.MailService;

@Service
public class UserEmailService {

	private static final long EXPIRE_MIN = 5;
	private static final long VERIFIED_EXPIRE_MIN = 30;

	@Autowired
	private RedisTemplate<String, Object> redisTemplate;

	@Autowired
	private MailService mailService;

	@Autowired
	private UserRepository userRepository;

	public boolean isDuplicateEmail(String email) {
		return userRepository.existsByEmail(email);
	}

	public void sendCode(String email) {
		String code = createCode();
		String key = "EMAIL_AUTH:" + email;

		redisTemplate.opsForValue()
			.set(key, code, EXPIRE_MIN, TimeUnit.MINUTES);

		mailService.sendAuthCode(email, code);
	}

	public boolean verifyCode(String email, String inputCode) {
		return verifyCode(email, inputCode, true);
	}

	public boolean verifyCode(String email, String inputCode, boolean consume) {
		String key = "EMAIL_AUTH:" + email;
		Object savedCode = redisTemplate.opsForValue().get(key);

		if (savedCode == null) {
			return false;
		}

		boolean success = savedCode.toString().equals(inputCode);
		if (success && consume) {
			redisTemplate.delete(key);
			String verifiedKey = "EMAIL_VERIFIED:" + email;
			redisTemplate.opsForValue()
				.set(verifiedKey, "Y", VERIFIED_EXPIRE_MIN, TimeUnit.MINUTES);
		}

		return success;
	}

	private String createCode() {
		return String.valueOf(100000 + new Random().nextInt(900000));
	}
}
