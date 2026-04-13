package com.animalfarm.backend.domain.news.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// DB 저장 및 조회용 뉴스 DTO
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketNewsDTO {
	private Long newsId;
	private Long tokenId;       // GLOBAL 뉴스일 경우 null
	private String summaryShort; // 1줄 요약
	private String summaryText;  // 데이터 분석 본문
	private String newsType;    // GLOBAL, TOKEN
	private LocalDateTime createdAt;

	// 👇 [추가됨] 프론트엔드 UI 위젯용 정량 데이터 트랙
	private Double avgChangeRate;     // 평균 등락률 (예: 1.52)
	private Double adrValue;          // 등락비율 (예: 250.0)
	private Double volGrowthRate;     // 전체 대금 증감률 (예: -68.1)
	private String highlightTokens;   // 특징주 이름 모음 (예: "지리산 꾸지뽕 1호, 과수원 2호")

}