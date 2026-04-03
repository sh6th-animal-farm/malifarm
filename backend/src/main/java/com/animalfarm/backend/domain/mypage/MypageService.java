package com.animalfarm.backend.domain.mypage;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.animalfarm.backend.domain.mypage.dto.CarbonHistoryDTO;
import com.animalfarm.backend.domain.mypage.dto.HoldingDTO;
import com.animalfarm.backend.domain.mypage.dto.MyTransactionHistDTO;
import com.animalfarm.backend.domain.mypage.dto.MypageWalletDTO;
import com.animalfarm.backend.domain.mypage.dto.MypageProjectDTO;
import com.animalfarm.backend.domain.mypage.dto.PasswordUpdateRequestDTO;
import com.animalfarm.backend.domain.mypage.dto.ProfileDTO;
import com.animalfarm.backend.domain.mypage.dto.ProfileUpdateRequestDTO;
import com.animalfarm.backend.domain.mypage.dto.ProjectTabsDTO;
import com.animalfarm.backend.domain.mypage.dto.TokenInfoDTO;
import com.animalfarm.backend.domain.mypage.dto.UserInfoDTO;
import com.animalfarm.backend.global.dto.ExternalApiResponseDTO;
import com.animalfarm.backend.global.dto.PagedResponseDTO;
import com.animalfarm.backend.global.http.ExternalApiClient;
import com.animalfarm.backend.global.security.SecurityUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MypageService {

	private final MypageRepository mypageRepository;
	private final RestTemplate restTemplate;
	private final PasswordEncoder passwordEncoder;

	// 강황증권 API 서버 주소
	@Value("${api.kh-stock.url}")
	private String khUrl;

	@Autowired
	ExternalApiClient externalApiClient;

	// ---------------------------------------------------------
	// 거래 내역 조회
	// ---------------------------------------------------------
	public List<MyTransactionHistDTO> getTransactionHistory(int page, int period, String category) {
		Long walletId = validateAndGetWalletId();
		if (walletId == null) {
			return new ArrayList<>();
		}

		// 별도의 로직 없이 바로 외부 API 호출
		return fetchList(walletId, page, period, category);
	}

	private List<MyTransactionHistDTO> fetchList(Long walletId, int page, int period, String apiCategory) {
		try {
			// 변경된 명세: /api/my/transaction/{walletId}?page=..&period=..&category=..
			StringBuilder urlBuilder = new StringBuilder(khUrl)
				.append("api/my/transaction/").append(walletId)
				.append("?page=").append(page)
				.append("&period=").append(period);

			// category가 있을 때만 붙임 (필수가 아니라면 null 체크 유지)
			// 명세상 TOKEN, PROJECT 등이 default값 역할을 하므로 무조건 보내는 게 안전함
			if (apiCategory != null && !apiCategory.isEmpty()) {
				urlBuilder.append("&category=").append(apiCategory);
			}

			ResponseEntity<ExternalApiResponseDTO<List<MyTransactionHistDTO>>> response = restTemplate.exchange(
				urlBuilder.toString(), HttpMethod.GET, null,
				new ParameterizedTypeReference<ExternalApiResponseDTO<List<MyTransactionHistDTO>>>() {
				});

			if (response.getBody() != null) {

				// 나의 거래내역 원본 리스트
				List<MyTransactionHistDTO> originalList = response.getBody().getPayload();

				// DB 조회가 필요한 유형 정의
				Set<String> targetTypes = Set.of("PASS", "FAIL", "BURN");

				// DB 조회가 필요한 거래 번호만 필터링하여 리스트 생성
				List<Long> targetIds = originalList.stream()
					.filter(txHist -> targetTypes.contains(txHist.getTransactionType()))
					.map(MyTransactionHistDTO::getTransactionId)
					.collect(Collectors.toList());

				// DB 조회하여 토큰 정보 주입
				if (!targetIds.isEmpty()) {
					List<TokenInfoDTO> tokenInfoList = mypageRepository.findTokenInfoByTxId(targetIds);

					if (!tokenInfoList.isEmpty()) {
						// DB에서 조회한 토큰 정보 리스트를 Map으로 변환 (Key: externalRefId, Value: TokenInfoDTO)
						Map<Long, TokenInfoDTO> tokenMap = tokenInfoList.stream()
							.collect(Collectors.toMap(TokenInfoDTO::getExternalRefId, info -> info));

						// 원본 리스트를 순회하며 토큰 정보 주입
						originalList.forEach(txHist -> {
							TokenInfoDTO info = tokenMap.get(
								txHist.getTransactionId()); // 강황증권의 transactionId == 마리팜의 externalRefID
							if (info != null) {
								txHist.setTokenName(info.getTokenName());
								txHist.setTickerSymbol(info.getTickerSymbol());
							}
						});
					}
				}

				return originalList;
			}

			return new ArrayList<>(); // response body가 null이면 빈 리스트 반환

		} catch (Exception e) {
			System.err.println("[ERROR] API 호출 실패: " + e.getMessage());
			return new ArrayList<>();
		}
	}

	// ---------------------------------------------------------
	// 탄소 구매 내역 조회
	// ---------------------------------------------------------

	private static final DateTimeFormatter DF = DateTimeFormatter.ofPattern("yyyy. MM. dd");

	public List<CarbonHistoryDTO> getCarbonHistory() {
		Long userId = SecurityUtil.getCurrentUserId();
		return mypageRepository.selectCarbonHistoryByUserId(userId);
	}

	// ---------------------------------------------------------
	// 나의 지갑
	// ---------------------------------------------------------

	// 공통 유틸리티: 연동된 지갑 ID 확인
	private Long validateAndGetWalletId() {
		Long userId = SecurityUtil.getCurrentUserId();
		if (userId == null) {
			return null;
		}
		return mypageRepository.getWalletIdByUserId(userId);
	}

	// 지갑 요약 정보 조회
	public MypageWalletDTO getWalletInfo() {
		Long walletId = validateAndGetWalletId();
		if (walletId == null) {
			return null; // 미연동 사용자 처리
		}

		try {
			String url = khUrl + "api/my/wallet/" + walletId;
			ResponseEntity<ExternalApiResponseDTO<MypageWalletDTO>> response = restTemplate.exchange(
				url, HttpMethod.GET, null,
				new ParameterizedTypeReference<ExternalApiResponseDTO<MypageWalletDTO>>() {
				});

			return (response.getBody() != null) ? response.getBody().getPayload() : null;
		} catch (Exception e) {
			System.err.println("[ERROR] 지갑 API 호출 실패: " + e.getMessage());
			return null;
		}
	}

	// 보유 토큰 목록 조회 (페이징)
	public List<HoldingDTO> getHoldings(int page) {
		Long walletId = validateAndGetWalletId();
		if (walletId == null) {
			return new ArrayList<>();
		}

		try {
			String url = khUrl + "api/my/token/" + walletId + "?page=" + page;
			ResponseEntity<ExternalApiResponseDTO<List<HoldingDTO>>> response = restTemplate.exchange(
				url, HttpMethod.GET, null,
				new ParameterizedTypeReference<ExternalApiResponseDTO<List<HoldingDTO>>>() {
				});

			return (response.getBody() != null) ? response.getBody().getPayload() : new ArrayList<>();
		} catch (Exception e) {
			System.err.println("[ERROR] 토큰 API 호출 실패: " + e.getMessage());
			return new ArrayList<>();
		}
	}

	// 계좌 연동하기
	@Transactional
	public Long linkKangHwangAccount() {
		Long userId = SecurityUtil.getCurrentUserId();
		if (userId == null) {
			return null;
		}

		// 이미 연동된 회원인지 먼저 확인
		Long existingWalletId = mypageRepository.getWalletIdByUserId(userId);
		if (existingWalletId != null) {
			// 이미 연동된 경우, 특수한 값(예: -1)을 반환하거나 예외를 던져 알림 처리
			return -1L;
		}

		try {
			// 1. 강황증권 API로 {userId}에 해당하는 지갑 연결
			String url = khUrl + "api/my/account/" + userId;

			Long walletId = externalApiClient.callApi(
				url,
				HttpMethod.GET,
				null,
				new ParameterizedTypeReference<ExternalApiResponseDTO<Long>>() {}
			);

			// 2. 연동할 지갑이 있으면, 우리 DB(user_certificate_links)에 저장
			if (walletId != null) {
				// 랜덤 토큰 및 만료 시간 생성 (테이블 NOT NULL 제약 조건 대응)
				String randomAccessToken = UUID.randomUUID().toString();
				String randomRefreshToken = UUID.randomUUID().toString();

				// 3. DB 저장 (certificates_id는 1로 고정)
				mypageRepository.upsertUserWalletLink(
					userId,
					walletId,
					randomAccessToken,
					randomRefreshToken);
				return walletId;
			}
		} catch (Exception e) {
			System.err.println("[ERROR] 계좌 연동 실패: " + e.getMessage());
		}
		return null; // 계좌가 없으면 null 반환
	}

	// 계좌 생성 및 연동하기
	@Transactional
	public Long craeteLinkAccount() {
		Long userId = SecurityUtil.getCurrentUserId();
		if (userId != null) {
			try {
				// 1. 사용자 정보 받아오기 (강황증권 계정 없을 때 생성하기 위함)
				UserInfoDTO userInfo = mypageRepository.getUserInfoById(userId);

				// 2. 강황증권 API로 {userId}에 해당하는 지갑 연결
				String url = khUrl + "api/my/create-account";

				Long walletId = externalApiClient.callApi(
					url,
					HttpMethod.POST,
					userInfo,
					new ParameterizedTypeReference<ExternalApiResponseDTO<Long>>() {
					}
				);

				// 3. 연동할 지갑이 있으면, 우리 DB(user_certificate_links)에 저장
				if (walletId != null) {
					// 랜덤 토큰 및 만료 시간 생성 (테이블 NOT NULL 제약 조건 대응)
					String randomAccessToken = UUID.randomUUID().toString();
					String randomRefreshToken = UUID.randomUUID().toString();

					// 4. DB 저장 (certificates_id는 1로 고정)
					mypageRepository.upsertUserWalletLink(
						userId,
						walletId,
						randomAccessToken,
						randomRefreshToken);
					return walletId;
				}
			} catch (Exception e) {
				System.err.println("[ERROR] 계좌 생성 및 연동 실패: " + e.getMessage());
			}
		}
		return null; // 계좌가 없으면 null 반환
	}

	public ProfileDTO getProfile() {
		Long userId = SecurityUtil.getCurrentUserId();
		return mypageRepository.selectProfile(userId);
	}

	public void updateProfile(ProfileUpdateRequestDTO req) {
		Long userId = SecurityUtil.getCurrentUserId();
		mypageRepository.updateProfile(userId, req);
	}

	@Transactional
	public void updatePassword(PasswordUpdateRequestDTO dto) {

		Long userId = SecurityUtil.getCurrentUserId();

		if (dto == null
			|| dto.getCurrentPassword() == null
			|| dto.getNewPassword() == null) {
			throw new IllegalArgumentException("비밀번호 입력값이 올바르지 않습니다.");
		}

		// 1. 현재 비밀번호(암호화) 조회
		String encodedPassword = mypageRepository.selectPasswordByUserId(userId);
		if (encodedPassword == null) {
			throw new IllegalStateException("사용자 정보를 찾을 수 없습니다.");
		}

		// 2. 현재 비밀번호 검증
		if (!passwordEncoder.matches(dto.getCurrentPassword(), encodedPassword)) {
			throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
		}

		// 3. 새 비밀번호 암호화
		String newEncodedPassword = passwordEncoder.encode(dto.getNewPassword());

		// 4. 비밀번호 업데이트
		mypageRepository.updatePassword(userId, newEncodedPassword);
	}

	private String mapProjectStatus(String s) {
		if (s == null) {
			return "-";
		}
		switch (s) {
			case "SUBSCRIPTION":
				return "청약중";
			case "ANNOUNCEMENT":
				return "공고중";
			case "INPROGRESS":
				return "진행중";
			case "ENDED":
				return "종료";
			case "PREPARING":
				return "준비중";
			default:
				return s;
		}
	}

	private String mapSubscriptionStatus(String s) {
		if (s == null) {
			return null;
		}
		switch (s) {
			case "PENDING":
				return "청약중";
			case "APPROVED":
				return "당첨";
			case "REJECTED":
				return "낙첨";
			case "CANCELED":
				return "취소";
			default:
				return s;
		}
	}

	private String fmt(OffsetDateTime dt) {
		return dt == null ? "-" : dt.format(DF);
	}

	private void decorate(MypageProjectDTO p, boolean joinedTab) {
		p.setPeriodText(fmt(p.getProjectStartDate()) + " - " + fmt(p.getProjectEndDate()));
		p.setStatusText1(mapProjectStatus(p.getProjectStatus()));
		p.setStatusText2(joinedTab ? mapSubscriptionStatus(p.getSubscriptionStatus()) : null);
	}

	public ProjectTabsDTO getProjectTabs() {
		Long userId = SecurityUtil.getCurrentUserId();
		// 탭 카운트는 전체 기준(필터 ALL)
		int joined = (int)mypageRepository.countJoinedProjectCards(userId, "ALL");
		int starred = (int)mypageRepository.countStarredProjectCards(userId, "ALL");
		return new ProjectTabsDTO(joined, starred);
	}

	@Transactional(readOnly = true)
	public PagedResponseDTO<MypageProjectDTO> getProjectCards(String type, String status, int page, int size) {
		Long userId = SecurityUtil.getCurrentUserId();
		int limit = Math.max(1, Math.min(size, 30));
		int offset = Math.max(0, (page - 1) * limit);

		boolean joinedTab = "JOIN".equalsIgnoreCase(type);
		List<MypageProjectDTO> list;
		long total;

		if (joinedTab) {
			list = mypageRepository.selectJoinedProjectCards(userId, status, limit, offset);
			total = mypageRepository.countJoinedProjectCards(userId, status);
		} else {
			list = mypageRepository.selectStarredProjectCards(userId, status, limit, offset);
			total = mypageRepository.countStarredProjectCards(userId, status);
		}

		for (MypageProjectDTO p : list) {
			decorate(p, joinedTab);
		}

		boolean hasNext = (offset + list.size()) < total;
		return new PagedResponseDTO<>(list, page, limit, total, hasNext);
	}

	@Transactional
	public void setStarred(Long projectId, boolean starred) {
		Long userId = SecurityUtil.getCurrentUserId();
		mypageRepository.upsertStarredProject(userId, projectId, starred);
	}

}
