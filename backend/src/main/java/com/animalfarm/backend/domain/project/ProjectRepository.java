package com.animalfarm.backend.domain.project;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.animalfarm.backend.domain.project.dto.FarmDTO;
import com.animalfarm.backend.domain.project.dto.FarmEnvChartPointDTO;
import com.animalfarm.backend.domain.project.dto.ProjectDTO;
import com.animalfarm.backend.domain.project.dto.ProjectDetailDTO;
import com.animalfarm.backend.domain.project.dto.ProjectInsertDTO;
import com.animalfarm.backend.domain.project.dto.ProjectListDTO;
import com.animalfarm.backend.domain.project.dto.ProjectPictureDTO;
import com.animalfarm.backend.domain.project.dto.ProjectSearchReqDTO;
import com.animalfarm.backend.domain.project.dto.ProjectStarredDTO;
import com.animalfarm.backend.domain.project.dto.ProjectStatusDTO;

@Mapper
public interface ProjectRepository {

	List<ProjectDTO> selectAll();

	List<ProjectListDTO> selectByCondition(ProjectSearchReqDTO projectSearchDTO);

	List<ProjectListDTO> selectByConditionForMain(ProjectSearchReqDTO projectSearchDTO);

	ProjectDetailDTO selectDetail(Long projectId);

	boolean selectStarredProject(ProjectStarredDTO projectStarredDTO);

	boolean getStarredStatus(ProjectStarredDTO projectStarredDTO);

	void insertStrarredProject(ProjectStarredDTO projectStarredDTO);

	void updateStarred(ProjectStarredDTO projectStarredDTO);

	void insertProject(ProjectInsertDTO projectInsertDTO);

	List<FarmDTO> selectAllFarm();

	void insertToken(ProjectInsertDTO projectInsertDTO);

	void updateProject(ProjectDTO projectDTO);

	List<ProjectPictureDTO> selectPictures(Long projectId);

	void insertPictureList(List<ProjectPictureDTO> newPictureDTOs);

	void deletePictureList(List<Long> deletedPictureIds);

	List<ProjectStatusDTO> selectStatus();

	void updateProjectStatus(ProjectStatusDTO projectStatusDTO);

	ProjectDTO selectByProjectId(Long projectId);

	List<FarmEnvChartPointDTO> selectFarmEnvChartData(
		@Param("projectId") Long projectId,
		@Param("range") String range
	);

	Long selectMyWalletId(Long userId);

	List<ProjectDTO> selectEndTargetProject();

}
