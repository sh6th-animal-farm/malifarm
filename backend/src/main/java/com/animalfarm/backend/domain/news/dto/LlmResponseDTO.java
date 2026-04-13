package com.animalfarm.backend.domain.news.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LlmResponseDTO {
	private String shortSummary; // 1줄 요약
	private String textBody;     // 데이터 분석 본문
}
