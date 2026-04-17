package com.animalfarm.backend.domain.home;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.animalfarm.backend.domain.project.ProjectService;
import com.animalfarm.backend.domain.project.dto.ProjectListDTO;
import com.animalfarm.backend.domain.project.dto.ProjectSearchReqDTO;
import com.animalfarm.backend.domain.token.TokenService;
import com.animalfarm.backend.domain.token.dto.TokenSummaryDTO;
import com.animalfarm.backend.global.dto.ApiResponseDTO;
import com.animalfarm.backend.global.exception.BusinessException;
import com.animalfarm.backend.global.exception.ErrorCode;
import com.animalfarm.backend.global.security.SecurityUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/home")
public class HomeController {

	private final TokenService tokenService;
	private final ProjectService projectService;

	@GetMapping("/project")
	public ResponseEntity<ApiResponseDTO<List<ProjectListDTO>>> getProjectList(ProjectSearchReqDTO searchReqDTO) {
		Long userId = null;
		try {
			userId = SecurityUtil.getCurrentUserId();
		} catch (Exception e) {
			userId = null;
		}
		try {
			searchReqDTO.setUserId(userId);
			List<ProjectListDTO> list = projectService.selectByConditionForMain(searchReqDTO);
			return ResponseEntity.ok(ApiResponseDTO.success(list));
		} catch (Exception e) {
			log.error("프로젝트 목록 조회 중 서버 오류 발생: ", e);
			throw new BusinessException(ErrorCode.PROJECT_LIST_FETCH_ERROR);
		}
	}

	@GetMapping("/token")
	public ResponseEntity<ApiResponseDTO<List<TokenSummaryDTO>>> getTokenList() {
		List<TokenSummaryDTO> tokenAllList = tokenService.selectAll();
		List<TokenSummaryDTO> list = tokenAllList.stream()
			.limit(10)
			.collect(Collectors.toList());
		return ResponseEntity.ok(ApiResponseDTO.success(list));
	}
}