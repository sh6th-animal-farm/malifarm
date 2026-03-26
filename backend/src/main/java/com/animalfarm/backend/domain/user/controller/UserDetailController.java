package com.animalfarm.backend.domain.user.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.animalfarm.backend.domain.user.dto.UserDTO;
import com.animalfarm.backend.domain.user.service.UserService;
import com.animalfarm.backend.global.security.SecurityUtil;

@RestController
@RequestMapping("/api/user")
public class UserDetailController {

	@Autowired
	private UserService userService;

	@GetMapping("/me")
	public ResponseEntity<Object> getCurrentUserInfo() {
		try {
			Long userId = SecurityUtil.getCurrentUserId();
			if (userId == null) {
				// 토큰이 없거나 유효하지 않은 경우 401 반환
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
			}

			// 유저 정보 조회 (address 포함)
			UserDTO user = userService.getUserById(userId);
			return ResponseEntity.ok(user);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
		}
	}

	@GetMapping(value = "/me/name", produces = "text/plain; charset=UTF-8")
	public ResponseEntity<String> getMyName() {
		return ResponseEntity.ok(userService.getMyName());
	}

	@GetMapping("/me/role")
	public ResponseEntity<String> getMyRole() {
		return ResponseEntity.ok(userService.getMyRole());
	}
}
