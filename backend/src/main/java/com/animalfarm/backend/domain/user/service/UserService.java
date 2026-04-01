package com.animalfarm.backend.domain.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.animalfarm.backend.domain.user.dto.UserDTO;
import com.animalfarm.backend.domain.user.repository.UserRepository;
import com.animalfarm.backend.global.RedisUtil;
import com.animalfarm.backend.global.security.SecurityUtil;

@Service
public class UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final RedisUtil redisUtil;

	@Autowired
	public UserService(UserRepository userRepository,
		PasswordEncoder passwordEncoder,
		RedisUtil redisUtil) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.redisUtil = redisUtil;
	}

	public String selectAddress() {
		return userRepository.selectAddress(SecurityUtil.getCurrentUserId());
	}

	public void updateAddress(String address) {
		Long userId = SecurityUtil.getCurrentUserId();
		userRepository.updateAddress(address, userId);
	}

	public UserDTO getUserById(Long userId) {
		return userRepository.getUserById(userId);
	}

	public String getMyName() {
		Long userId = SecurityUtil.getCurrentUserId();
		if (userId == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
		}

		String name = userRepository.selectUserNameById(userId);
		if (name == null || name.isBlank()) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자 이름이 없습니다.");
		}

		return name;
	}

	public String getMyRole() {
		Long userId = SecurityUtil.getCurrentUserId();
		if (userId == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
		}

		String role = userRepository.selectUserRoleById(userId);
		if (role == null || role.isBlank()) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자 권한이 없습니다.");
		}

		return role;
	}

}
