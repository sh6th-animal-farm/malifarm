package com.animalfarm.backend.domain.user.service;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.animalfarm.backend.domain.user.dto.UserDTO;
import com.animalfarm.backend.domain.user.dto.UserInvestmentLimitDTO;
import com.animalfarm.backend.domain.user.repository.UserRepository;
import com.animalfarm.backend.global.RedisUtil;
import com.animalfarm.backend.global.exception.BusinessException;
import com.animalfarm.backend.global.exception.ErrorCode;
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

	public UserInvestmentLimitDTO getUserInvestmentLimit(Long userId) {
		// 1. DB에서 한도 정보 조회 (Mapper 호출)
		UserInvestmentLimitDTO limitDTO = userRepository.selectUserInvestmentLimit(userId);

		if (limitDTO == null) {
			throw new BusinessException(ErrorCode.USER_NOT_FOUND);
		}

		// 2. 가독성을 위해 현재 잔여 한도(Available)를 한 번 더 계산해서 세팅 (쿼리에서도 하지만 이중 확인)
		BigDecimal available = limitDTO.getAnnualLimit().subtract(limitDTO.getUsedLimit());
		limitDTO.setAvailableLimit(available.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : available);

		return limitDTO;
	}

}
