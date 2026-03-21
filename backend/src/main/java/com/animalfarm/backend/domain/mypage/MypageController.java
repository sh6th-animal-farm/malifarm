package com.animalfarm.backend.domain.mypage;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.animalfarm.backend.domain.mypage.dto.CarbonHistoryDTO;
import com.animalfarm.backend.domain.mypage.dto.HoldingDTO;
import com.animalfarm.backend.domain.mypage.dto.MyTransactionHistDTO;
import com.animalfarm.backend.domain.mypage.dto.PasswordUpdateRequestDTO;
import com.animalfarm.backend.domain.mypage.dto.ProfileDTO;
import com.animalfarm.backend.domain.mypage.dto.ProfileUpdateRequestDTO;
import com.animalfarm.backend.domain.mypage.dto.ProjectDTO;
import com.animalfarm.backend.domain.mypage.dto.ProjectTabsDTO;
import com.animalfarm.backend.domain.mypage.dto.WalletDTO;
import com.animalfarm.backend.global.dto.ExternalApiResponseDTO;
import com.animalfarm.backend.global.dto.PagedResponseDTO;

@RestController
@RequestMapping("/api/mypage")
public class MypageController {

	@Autowired
	private MypageService mypageService;

	// 거래 내역 조회 (kh)
	@GetMapping("/transaction-history")
	public ResponseEntity<ExternalApiResponseDTO<List<MyTransactionHistDTO>>> getTransactionHistory(
		@RequestParam(value = "page", defaultValue = "1") int page,
		@RequestParam(value = "period", defaultValue = "0") int period,
		@RequestParam(value = "category", required = false) String category) {
		List<MyTransactionHistDTO> list = mypageService.getTransactionHistory(page, period, category);
		return ResponseEntity.ok(new ExternalApiResponseDTO<>("거래 내역 조회 성공", list));
	}

	// 탄소 구매 내역 조회
	@GetMapping("/carbon-history")
	public ResponseEntity<List<CarbonHistoryDTO>> getCarbonHistory() {
		// 서비스 내부에서 유저 ID를 조회하도록 설계된 메서드를 호출합니다.
		return ResponseEntity.ok(mypageService.getCarbonHistory());
	}

	// 보유 토큰 조회 (kh)
	@GetMapping("/holdings")
	public ResponseEntity<ExternalApiResponseDTO<List<HoldingDTO>>> getHoldings(
		@RequestParam(defaultValue = "1") int page) {
		List<HoldingDTO> list = mypageService.getHoldings(page);
		return ResponseEntity.ok(new ExternalApiResponseDTO<>("보유 토큰 조회 성공", list));
	}

	// 나의 지갑 (kh)
	@GetMapping("/wallet-info")
	public ResponseEntity<ExternalApiResponseDTO<WalletDTO>> getWalletInfo() {
		WalletDTO wallet = mypageService.getWalletInfo();
		return ResponseEntity.ok(new ExternalApiResponseDTO<>("지갑 정보 조회 성공", wallet));
	}

	// 연동하기 (kh)
	@GetMapping("/account/link")
	public ResponseEntity<ExternalApiResponseDTO<Long>> linkAccounOt() {
		Long result = mypageService.linkGangHwangAccount();

		if (result != null && result == -1L) {
			return ResponseEntity.status(HttpStatus.CONFLICT) // 409 Conflict
				.body(new ExternalApiResponseDTO<>("이미 연동된 회원입니다.", null));
		} else if (result != null) {
			return ResponseEntity.ok(new ExternalApiResponseDTO<>("계좌 연동에 성공했습니다.", result));
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(new ExternalApiResponseDTO<>("연동 가능한 강황증권 계좌를 찾을 수 없습니다.", null));
		}
	}

	// 내 정보 조회
	@GetMapping("/profile")
	public ResponseEntity<ProfileDTO> getProfile() {
		return ResponseEntity.ok(mypageService.getProfile());
	}

	// 내 정보 수정
	@PatchMapping("/profile")
	public ResponseEntity<Void> updateProfile(@RequestBody ProfileUpdateRequestDTO dto) {
		mypageService.updateProfile(dto);
		return ResponseEntity.ok().build();
	}

	// 비밀번호 수정
	@PatchMapping("/password")
	public ResponseEntity<Void> updatePassword(@RequestBody PasswordUpdateRequestDTO dto) {
		mypageService.updatePassword(dto);
		return ResponseEntity.ok().build();
	}

	// 내 프로젝트 조회
	@GetMapping("/projects/tabs")
	public ResponseEntity<ProjectTabsDTO> getProjectTabs() {
		return ResponseEntity.ok(mypageService.getProjectTabs());
	}

	@GetMapping("/projects")
	public ResponseEntity<PagedResponseDTO<ProjectDTO>> getProjects(
		@RequestParam(defaultValue = "JOIN") String type,
		@RequestParam(defaultValue = "ALL") String status,
		@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "10") int size) {
		return ResponseEntity.ok(mypageService.getProjectCards(type, status, page, size));
	}

	@PatchMapping("/projects/star")
	public ResponseEntity<Void> toggleStar(
		@RequestParam Long projectId,
		@RequestParam boolean starred) {
		mypageService.setStarred(projectId, starred);
		return ResponseEntity.ok().build();
	}
}
