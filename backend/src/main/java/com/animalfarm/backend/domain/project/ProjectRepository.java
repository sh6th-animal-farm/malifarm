package com.animalfarm.backend.domain.project;

import org.apache.ibatis.annotations.Mapper;

import com.animalfarm.backend.domain.project.dto.ProjectDetailDTO;

@Mapper
public interface ProjectRepository {

	public abstract ProjectDetailDTO selectDetail(Long projectId);
}
