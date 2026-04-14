package com.animalfarm.backend.domain.news;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.animalfarm.backend.domain.news.dto.MarketNewsDTO;
import com.animalfarm.backend.global.dto.ApiResponseDTO;
import com.animalfarm.backend.global.exception.BusinessException;
import com.animalfarm.backend.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class MarketNewsController {

	private final MarketNewsRepository newsRepository;
	private final MarketNewsService marketNewsService;

	// 1. 글로벌 뉴스 전체 리스트 조회
	@GetMapping("/global/list")
	public ResponseEntity<ApiResponseDTO<List<MarketNewsDTO>>> getGlobalNewsList() {
		List<MarketNewsDTO> list = newsRepository.selectNewsByType("GLOBAL");
		return ResponseEntity.ok(ApiResponseDTO.success(list));
	}

	// 2. 글로벌 뉴스 상세 조회 (newsId 기반)
	@GetMapping("/global/{newsId}")
	public ResponseEntity<ApiResponseDTO<MarketNewsDTO>> getGlobalNewsDetail(@PathVariable Long newsId) {
		MarketNewsDTO detail = newsRepository.selectNewsById(newsId);

		if (detail == null) {
			throw new BusinessException(ErrorCode.NEWS_NOT_FOUND);
		}
		return ResponseEntity.ok(ApiResponseDTO.success(detail));
	}

	// 3. 글로벌 뉴스 실행 (발행)
	@GetMapping("/global/publish")
	public void publishGlobalNews() {
		marketNewsService.generateGlobalNews();
	}
}
