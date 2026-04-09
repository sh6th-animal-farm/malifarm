package com.animalfarm.backend.domain.user.service;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

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

	@Autowired
	private UserEmailService userEmailService;

	private static final Pattern LETTER_PATTERN = Pattern.compile("[A-Za-z]");
	private static final Pattern NUMBER_PATTERN = Pattern.compile("[0-9]");
	private static final Pattern SPECIAL_PATTERN = Pattern.compile("[^A-Za-z0-9]");

	private boolean isBlank(String s) {
		return s == null || s.isBlank();
	}

	private String emailVerifiedKey(String email) {
		return "EMAIL_VERIFIED:" + email;
	}

	private void validatePasswordRule(String password) {
		boolean hasLetter = LETTER_PATTERN.matcher(password).find();
		boolean hasNumber = NUMBER_PATTERN.matcher(password).find();
		boolean hasSpecial = SPECIAL_PATTERN.matcher(password).find();

		int combinationCount = 0;
		if (hasLetter)
			combinationCount++;
		if (hasNumber)
			combinationCount++;
		if (hasSpecial)
			combinationCount++;

		if (combinationCount < 2) {
			throw new IllegalArgumentException("비밀번호는 영문, 숫자, 특수문자 중 2종류 이상을 조합해야 합니다.");
		}

		if (combinationCount == 2 && password.length() < 10) {
			throw new IllegalArgumentException("비밀번호는 영문, 숫자, 특수문자 중 2종류 조합 시 10자 이상이어야 합니다.");
		}

		if (combinationCount >= 3 && password.length() < 8) {
			throw new IllegalArgumentException("비밀번호는 영문, 숫자, 특수문자 중 3종류 이상 조합 시 8자 이상이어야 합니다.");
		}
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

	public void resetPassword(String email, String verificationCode, String newPassword, String confirmPassword) {
		if (isBlank(email) || isBlank(verificationCode) || isBlank(newPassword) || isBlank(confirmPassword)) {
			throw new IllegalArgumentException("이메일, 인증코드, 새 비밀번호를 모두 입력해주세요.");
		}

		if (!newPassword.equals(confirmPassword)) {
			throw new IllegalArgumentException("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
		}

		UserDTO user = userRepository.findByEmail(email);
		if (user == null) {
			throw new RuntimeException("존재하지 않는 사용자입니다.");
		}

		boolean validCode = userEmailService.verifyCode(email, verificationCode, true);
		if (!validCode) {
			throw new RuntimeException("인증 코드가 올바르지 않습니다.");
		}

		validatePasswordRule(newPassword);

		userRepository.updatePasswordByEmail(email, passwordEncoder.encode(newPassword));
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
		if (isBlank(req.getPhoneNumber())) {
			throw new IllegalArgumentException("휴대폰 번호가 필요합니다.");
		}

		if (userRepository.findByEmail(req.getEmail()) != null) {
			throw new IllegalArgumentException("이미 가입된 이메일입니다.");
		}

		String verified = redisUtil.getData(emailVerifiedKey(req.getEmail()));
		if (verified == null) {
			throw new IllegalStateException("이메일 인증이 완료되지 않았습니다.");
		}

		validatePasswordRule(req.getPassword());

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
