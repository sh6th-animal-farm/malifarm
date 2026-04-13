package com.animalfarm.backend.domain.news;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.animalfarm.backend.domain.news.dto.MarketNewsDTO;

@Mapper // MyBatis 매퍼 인터페이스
public interface MarketNewsRepository {

	// 뉴스 저장
	void saveNews(MarketNewsDTO newsDTO);

	// 뉴스 타입별 조회 (GLOBAL/TOKEN)
	List<MarketNewsDTO> selectNewsByType(String newsType);

	// 특정 뉴스 상세  조회
	MarketNewsDTO selectNewsById(Long newsId);
}