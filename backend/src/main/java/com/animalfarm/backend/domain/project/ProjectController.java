package com.animalfarm.backend.domain.project;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.animalfarm.backend.domain.accounting.DividendService;
import com.animalfarm.backend.domain.accounting.dto.DividendSelectDTO;
import com.animalfarm.backend.domain.project.dto.FarmDTO;
import com.animalfarm.backend.domain.project.dto.ProjectDTO;
import com.animalfarm.backend.domain.project.dto.ProjectDetailDTO;
import com.animalfarm.backend.domain.project.dto.ProjectInsertDTO;
import com.animalfarm.backend.domain.project.dto.ProjectListDTO;
import com.animalfarm.backend.domain.project.dto.ProjectPictureDTO;
import com.animalfarm.backend.domain.project.dto.ProjectSearchReqDTO;
import com.animalfarm.backend.domain.project.dto.ProjectStarredDTO;
import com.animalfarm.backend.domain.user.dto.WalletDTO;
import com.animalfarm.backend.global.dto.ApiResponseDTO;
import com.animalfarm.backend.global.exception.BusinessException;
import com.animalfarm.backend.global.exception.ErrorCode;
import com.animalfarm.backend.global.security.SecurityUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/project")
public class ProjectController {

	private final ProjectService projectService;
	private final FarmService farmService;

	@Autowired
	DividendService dividendService;

	@InitBinder
	protected void initBinder(WebDataBinder binder) {
		// 억지로 객체 만들지 말고, 들어오는 문자열 그대로 처리하라고 스프링한테 명령
		binder.registerCustomEditor(java.time.OffsetDateTime.class, new java.beans.PropertyEditorSupport() {
			@Override
			public void setAsText(String text) {
				// "2026-01-20T20:35" -> "2026-01-20T20:35:00+09:00" 강제 변환
				setValue(
					java.time.LocalDateTime.parse(text).atZone(java.time.ZoneId.of("Asia/Seoul")).toOffsetDateTime());
			}
		});
	}

	@GetMapping("/{projectId}")
	public ResponseEntity<ApiResponseDTO<ProjectDetailDTO>> selectDetail(@PathVariable("projectId") Long projectId) {
		ProjectDetailDTO data = projectService.selectDetail(projectId);
		return ResponseEntity.ok(ApiResponseDTO.success(data));
	}
	
	@GetMapping("/all")
	public ResponseEntity<ApiResponseDTO<List<ProjectDTO>>> selectAll() {
		List<ProjectDTO> data = projectService.selectAll();
		return ResponseEntity.ok(ApiResponseDTO.success(data));
	}

	@GetMapping("/")
	public List<ProjectListDTO> selectByCondition(@RequestBody
	ProjectSearchReqDTO searchDTO) {
		Long userId = null;
		try {
			userId = SecurityUtil.getCurrentUserId();
		} catch (Exception e) {
			userId = -1L;
		}
		searchDTO.setUserId(userId);
		return projectService.selectByCondition(searchDTO);
	}

	@GetMapping("/list")
	public ResponseEntity<ApiResponseDTO<List<ProjectListDTO>>> getProjectList(ProjectSearchReqDTO searchReqDTO) {
		Long userId = null;
		try {
			userId = SecurityUtil.getCurrentUserId();
		} catch (Exception e) {
			userId = null;
		}
		try {
			searchReqDTO.setUserId(userId);
			List<ProjectListDTO> list = projectService.selectByCondition(searchReqDTO);
			return ResponseEntity.ok(ApiResponseDTO.success(list));
		} catch (Exception e) {
			log.error("프로젝트 목록 조회 중 서버 오류 발생: ", e);
			throw new BusinessException(ErrorCode.PROJECT_LIST_FETCH_ERROR);
		}
	}

	//프로젝트 목록 조회
	@GetMapping("/starred")
	@Operation(summary = "관심 프로젝트 상태 조회", description = "특정 프로젝트의 관심 등록 여부를 반환")
	public ResponseEntity<ApiResponseDTO<Boolean>> getStarredStatus(
		@Parameter(description = "프로젝트 ID", required = true)
		@RequestParam Long projectId) {
		try {
			Long userId = SecurityUtil.getCurrentUserId();
			if (userId == null) {
				return ResponseEntity.ok(ApiResponseDTO.success(false, null));
			}
			ProjectStarredDTO projectStarredDTO = ProjectStarredDTO.builder()
				.userId(userId)
				.projectId(projectId)
				.build();

			boolean isStarred = projectService.getStarredStatus(projectStarredDTO);
			return ResponseEntity.ok(
				ApiResponseDTO.success(isStarred, "null")
			);
		} catch (Exception e) {
			log.error("관심 상태 조회 실패: {}", e.getMessage());
			throw new BusinessException(ErrorCode.STARRED_PROCESS_FAILED);
		}
	}

	// 관심 프로젝트 등록 및 해제 (Upsert)
	@PostMapping("/starred")
	@Operation(summary = "관심 프로젝트 등록/해제", description = "관심 프로젝트를 토글(등록<->해제) 처리")
	public ResponseEntity<ApiResponseDTO<Boolean>> upsertStarredProject(
		@Parameter(description = "프로젝트 ID", required = true)
		@RequestBody Long projectId) {
		try {
			log.info("관심 프로젝트 요청 - 프로젝트 ID: {}", projectId);
			Long userId = SecurityUtil.getCurrentUserId();
			ProjectStarredDTO projectStarredDTO = ProjectStarredDTO.builder()
				.userId(userId)
				.projectId(projectId)
				.build();
			projectService.upsertStrarredProject(projectStarredDTO);
			boolean currentStatus = projectService.getStarredStatus(projectStarredDTO);

			return ResponseEntity.ok(
				ApiResponseDTO.success(currentStatus, "관심 프로젝트 처리 성공")
			);
		} catch (Exception e) {
			log.error("관심 프로젝트 처리 실패: {}", e.getMessage(), e);
			throw new BusinessException(ErrorCode.STARRED_PROCESS_FAILED);
		}
	}

	@PostMapping("/insert")
	public ResponseEntity<String> insertProject(@RequestBody
	ProjectInsertDTO projectInsertDTO) {
		try {
			// 서비스에서 DB 저장 + API 호출을 한 번에 처리 (실패 시 서비스 내부에서 롤백됨)
			projectService.insertProject(projectInsertDTO);

			// 여기까지 무사히 왔다면 DB 커밋 완료 & API 전송 성공!
			return ResponseEntity.ok("success");

		} catch (RuntimeException e) {
			// 서비스에서 throw new RuntimeException 한 에러가 여기로 잡힙니다.
			// 이때 이미 DB는 롤백된 상태입니다.
			log.error("프로젝트 등록 실패 (DB 롤백 완료): {}", e.getMessage());

			// 사용자에게 에러 메시지를 전달 (예: "증권사 서비스 오류입니다.")
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body("fail: " + e.getMessage());

		} catch (Exception e) {
			log.error("예상치 못한 시스템 오류: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("system_error");
		}
	}

	@PostMapping("/update")
	public ResponseEntity<String> updateProject(@RequestBody
	ProjectDTO projectDTO) {
		if (projectService.updateProject(projectDTO)) {
			return ResponseEntity.ok("success");
		} else {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("업데이트 중 서버 오류가 발생했습니다.");
		}
	}

	@GetMapping("/picture/{projectId}/all")
	public List<ProjectPictureDTO> selectPictures(@PathVariable("projectId")
	Long projectId) {
		return projectService.selectPictures(projectId);
	}

	@GetMapping("/checkAccount")
	public ResponseEntity<ApiResponseDTO<Boolean>> checkAccount(Long userId) {
		boolean hasAccount = projectService.checkAccount();
		return ResponseEntity.ok(ApiResponseDTO.success(hasAccount));
	}

	@GetMapping("/walletInfo")
	public ResponseEntity<ApiResponseDTO<WalletDTO>> getMyWallet(Long userId) {
		WalletDTO wallet = projectService.selectMyWalletInfo(userId);
		if (wallet == null) {
			// 지갑 정보가 없을 경우 처리 (빈 객체 혹은 에러)
			return ResponseEntity.ok(ApiResponseDTO.success(new WalletDTO()));
		}
		return ResponseEntity.ok(ApiResponseDTO.success(wallet));
	}

	@GetMapping("/farm/all")
	public List<FarmDTO> selectAllFarm() {
		return farmService.selectAllFarm();
	}

	@PostMapping("/dividend/poll/select")
	public ResponseEntity<String> selectDividendType(@RequestBody
	DividendSelectDTO dividendSelectDTO) {
		Long dividendId = dividendSelectDTO.getDividendId();
		String dividendType = dividendSelectDTO.getDividendType();
		String address = dividendSelectDTO.getAddress();
		try {
			dividendService.processUserSelection(dividendId, dividendType, address);
			// 성공 시 성공 메시지 반환
			return ResponseEntity.ok("수령 방식 선택이 완료되었습니다.");
		} catch (Exception e) {
			// 실패 시 에러 메시지와 함께 400 또는 500 에러 반환
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
		}
	}

}
