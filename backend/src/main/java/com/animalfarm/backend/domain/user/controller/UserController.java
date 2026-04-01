package com.animalfarm.backend.domain.user.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.animalfarm.backend.domain.user.dto.UserDTO;
import com.animalfarm.backend.domain.user.service.UserService;
import com.animalfarm.backend.global.dto.ApiResponseDTO;
import com.animalfarm.backend.global.exception.ErrorCode;
import com.animalfarm.backend.global.security.SecurityUtil;

@RestController
@RequestMapping("/api/user")
public class UserController {

	@Autowired
	private UserService userService;

	@GetMapping("/me")
	public ResponseEntity<ApiResponseDTO<Object>> getCurrentUserInfo() {
		try {
			Long userId = SecurityUtil.getCurrentUserId();
			if (userId == null) {
				// 토큰이 없거나 유효하지 않은 경우 401 반환
				return ResponseEntity
					.status(HttpStatus.UNAUTHORIZED)
					.body(ApiResponseDTO.fail(ErrorCode.NEED_LOGIN.getCode(), ErrorCode.NEED_LOGIN.getMessage()));
			}

			// 유저 정보 조회 (address 포함)
			UserDTO user = userService.getUserById(userId);
			return ResponseEntity.ok(ApiResponseDTO.success(user));
		} catch (Exception e) {
			return ResponseEntity
				.status(HttpStatus.UNAUTHORIZED)
				.body(ApiResponseDTO.fail(ErrorCode.NEED_LOGIN.getCode(), ErrorCode.NEED_LOGIN.getMessage()));
		}
	}

	@GetMapping(value = "/me/name")
	public ResponseEntity<ApiResponseDTO<String>> getMyName() {
		String userName = userService.getMyName();
		return ResponseEntity.ok(ApiResponseDTO.success(userName));
	}

	@GetMapping("/me/role")
	public ResponseEntity<ApiResponseDTO<String>> getMyRole() {
		String userRole = userService.getMyRole();
		return ResponseEntity.ok(ApiResponseDTO.success(userRole));
	}
}
