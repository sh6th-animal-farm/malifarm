package com.animalfarm.backend.domain.home;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.animalfarm.backend.domain.project.ProjectService;
import com.animalfarm.backend.domain.project.dto.ProjectListDTO;
import com.animalfarm.backend.domain.token.TokenService;
import com.animalfarm.backend.domain.token.dto.TokenSummaryDTO;
import com.animalfarm.backend.global.dto.ApiResponseDTO;

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
	public ResponseEntity<ApiResponseDTO<List<ProjectListDTO>>> getProjectList() {
		List<ProjectListDTO> list = projectService.selectByConditionForMain();
		return ResponseEntity.ok(ApiResponseDTO.success(list));
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