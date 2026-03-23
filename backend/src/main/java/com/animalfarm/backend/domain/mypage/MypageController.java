package com.animalfarm.backend.domain.mypage;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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
import com.animalfarm.backend.global.dto.ApiResponseDTO;
import com.animalfarm.backend.global.dto.PagedResponseDTO;
import com.animalfarm.backend.global.exception.BusinessException;
import com.animalfarm.backend.global.exception.ErrorCode;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/mypage")
public class MypageController {

	@Autowired
	private MypageService mypageService;

	// 거래 내역 조회 (kh)
	@GetMapping("/transaction-history")
	public ResponseEntity<ApiResponseDTO<List<MyTransactionHistDTO>>> getTransactionHistory(
		@RequestParam(value = "page", defaultValue = "1") int page,
		@RequestParam(value = "period", defaultValue = "0") int period,
		@RequestParam(value = "category", required = false) String category) {
		List<MyTransactionHistDTO> list = mypageService.getTransactionHistory(page, period, category);
		return ResponseEntity.ok(ApiResponseDTO.success(list));
	}

	// 탄소 구매 내역 조회
	@GetMapping("/carbon-history")
	public ResponseEntity<ApiResponseDTO<List<CarbonHistoryDTO>>> getCarbonHistory() {
		// 서비스 내부에서 유저 ID를 조회하도록 설계된 메서드를 호출합니다.
		List<CarbonHistoryDTO> list = mypageService.getCarbonHistory();
		return ResponseEntity.ok(ApiResponseDTO.success(list));
	}

	// 보유 토큰 조회 (kh)
	@GetMapping("/holdings")
	public ResponseEntity<ApiResponseDTO<List<HoldingDTO>>> getHoldings(
		@RequestParam(defaultValue = "1") int page) {
		List<HoldingDTO> list = mypageService.getHoldings(page);
		return ResponseEntity.ok(ApiResponseDTO.success(list));
	}

	// 나의 지갑 (kh)
	@GetMapping("/wallet-info")
	public ResponseEntity<ApiResponseDTO<WalletDTO>> getWalletInfo() {
		WalletDTO wallet = mypageService.getWalletInfo();
		return ResponseEntity.ok(ApiResponseDTO.success(wallet));
	}

	// 연동하기 (kh)
	@GetMapping("/account/link")
	public ResponseEntity<ApiResponseDTO<Long>> linkAccounOt() {
		Long result = mypageService.linkGangHwangAccount();

		if (result != null && result == -1L) {
			throw new BusinessException(ErrorCode.EXTERNAL_API_ACC_EXIST);
		} else if (result != null) {
			return ResponseEntity.ok(ApiResponseDTO.success(result));
		} else {
			throw new BusinessException(ErrorCode.EXTERNAL_API_ACC_NOT_FOUND);
		}
	}

	// 내 정보 조회
	@GetMapping("/profile")
	public ResponseEntity<ApiResponseDTO<ProfileDTO>> getProfile() {
		ProfileDTO dto = mypageService.getProfile();
		return ResponseEntity.ok(ApiResponseDTO.success(dto));
	}

	// 내 정보 수정
	@PatchMapping("/profile")
	public ResponseEntity<ApiResponseDTO<Void>> updateProfile(@RequestBody ProfileUpdateRequestDTO dto) {
		mypageService.updateProfile(dto);
		return ResponseEntity.ok(ApiResponseDTO.success(null, "정보를 수정했습니다."));
	}

	// 비밀번호 수정
	@PatchMapping("/password")
	public ResponseEntity<ApiResponseDTO<Void>> updatePassword(@RequestBody PasswordUpdateRequestDTO dto) {
		mypageService.updatePassword(dto);
		return ResponseEntity.ok(ApiResponseDTO.success(null, "비밀번호를 수정했습니다."));
	}

	// 내 프로젝트 조회
	@GetMapping("/projects/tabs")
	public ResponseEntity<ApiResponseDTO<ProjectTabsDTO>> getProjectTabs() {
		ProjectTabsDTO dto = mypageService.getProjectTabs();
		return ResponseEntity.ok(ApiResponseDTO.success(dto));
	}

	@GetMapping("/projects")
	public ResponseEntity<ApiResponseDTO<PagedResponseDTO<ProjectDTO>>> getProjects(
		@RequestParam(defaultValue = "JOIN") String type,
		@RequestParam(defaultValue = "ALL") String status,
		@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "10") int size) {
		PagedResponseDTO<ProjectDTO> dto = mypageService.getProjectCards(type, status, page, size);
		return ResponseEntity.ok(ApiResponseDTO.success(dto));
	}

	@PatchMapping("/projects/star")
	public ResponseEntity<ApiResponseDTO<Void>> toggleStar(
		@RequestParam Long projectId,
		@RequestParam boolean starred) {
		mypageService.setStarred(projectId, starred);
		return ResponseEntity.ok(ApiResponseDTO.success(null, starred ? "관심 프로젝트에 등록되었습니다." : "관심 프로젝트에서 해제되었습니다."));
	}
}
