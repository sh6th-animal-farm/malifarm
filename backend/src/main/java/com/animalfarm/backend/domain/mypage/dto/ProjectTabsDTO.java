package com.animalfarm.backend.domain.mypage.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProjectTabsDTO {
	private int joinedCount;
	private int starredCount;
}