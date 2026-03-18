package com.animalfarm.backend.domain.project;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.animalfarm.backend.domain.project.dto.ProjectDetailDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/project")
public class ProjectController {

	private final ProjectService projectService;

	@GetMapping("/{projectId}")
	public ProjectDetailDTO selectDetail(@PathVariable("projectId") Long projectId) {
		return projectService.selectDetail(projectId);
	}
}
