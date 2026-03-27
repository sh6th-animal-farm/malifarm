package com.animalfarm.backend.domain.user.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.animalfarm.backend.domain.user.dto.LoginRequestDTO;
import com.animalfarm.backend.domain.user.dto.SignUpRequestDTO;
import com.animalfarm.backend.domain.user.dto.TokenResponseDTO;
import com.animalfarm.backend.domain.user.dto.UserDTO;
import com.animalfarm.backend.domain.user.repository.UserRepository;
import com.animalfarm.backend.global.JwtProvider;
import com.animalfarm.backend.global.RedisUtil;

@Service
public class AuthService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private JwtProvider jwtProvider;

	@Autowired
	private RedisUtil redisUtil;

	@Autowired
	private PasswordEncoder passwordEncoder;

	private boolean isBlank(String s) {
		return s == null || s.isBlank();
	}

	private String emailVerifiedKey(String email) {
		return "EMAIL_VERIFIED:" + email;
	}

	// 로그인
	public TokenResponseDTO login(LoginRequestDTO request) {

		UserDTO user = userRepository.findByEmail(request.getEmail());

		if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new RuntimeException("이메일 또는 비밀번호가 틀렸습니다.");
		}

		String accessToken = jwtProvider.createAccessToken(user.getEmail(), user.getRole());
		String refreshToken = jwtProvider.createRefreshToken(user.getEmail());

		redisUtil.saveRefreshToken(user.getEmail(), refreshToken);

		return new TokenResponseDTO(accessToken, refreshToken);
	}

	// 리프레쉬 토큰 재발급
	public Map<String, String> refresh(String oldRefreshToken) {

		if (!jwtProvider.validateToken(oldRefreshToken)) {
			throw new RuntimeException("Refresh 토큰이 만료되었거나 올바르지 않습니다.");
		}

		String email = jwtProvider.getUserEmail(oldRefreshToken);

		UserDTO user = userRepository.findByEmail(email);
		if (user == null) {
			throw new RuntimeException("존재하지 않는 사용자입니다.");
		}
		String role = user.getRole();

		String saveRt = redisUtil.getData("RT:" + email);

		if (saveRt == null || !saveRt.equals(oldRefreshToken)) {
			throw new RuntimeException("유효하지 않은 리프레시 토큰입니다.");
		}

		String newRefreshToken = jwtProvider.createRefreshToken(email);
		String newAccessToken = jwtProvider.createAccessToken(email, role);

		redisUtil.deleteData("RT:" + email);
		redisUtil.saveRefreshToken(email, newRefreshToken);

		Map<String, String> tokenMap = new HashMap<>();
		tokenMap.put("accessToken", newAccessToken);
		tokenMap.put("refreshToken", newRefreshToken);

		return tokenMap;
	}

	// 로그아웃
	public void logout(String accessToken) {

		String email = jwtProvider.getUserEmail(accessToken);
		redisUtil.deleteData("RT:" + email);

		long expiration = jwtProvider.getRemainingExpiration(accessToken);
		redisUtil.setBlackList(accessToken, "logout", expiration / (1000 * 60));
	}

	// 회원가입
	@Transactional
	public void signUp(SignUpRequestDTO req) {

		if (isBlank(req.getEmail())) {
			throw new IllegalArgumentException("이메일이 필요합니다.");
		}
		if (isBlank(req.getPassword())) {
			throw new IllegalArgumentException("비밀번호가 필요합니다.");
		}
		if (isBlank(req.getUserName())) {
			throw new IllegalArgumentException("이름이 필요합니다.");
		}

		if (userRepository.findByEmail(req.getEmail()) != null) {
			throw new IllegalArgumentException("이미 가입된 이메일입니다.");
		}

		String verified = redisUtil.getData(emailVerifiedKey(req.getEmail()));
		if (verified == null) {
			throw new IllegalStateException("이메일 인증이 완료되지 않았습니다.");
		}

		UserDTO user = new UserDTO();
		user.setEmail(req.getEmail());
		user.setUserName(req.getUserName());
		user.setPassword(passwordEncoder.encode(req.getPassword()));
		user.setPhoneNumber(req.getPhoneNumber());

		if (!isBlank(req.getBrn())) {
			user.setBrn(req.getBrn());
			user.setRole("ENTERPRISE");
		} else {
			user.setRole("USER");
		}

		userRepository.insertUser(user);

		redisUtil.deleteData(emailVerifiedKey(req.getEmail()));
	}
}
