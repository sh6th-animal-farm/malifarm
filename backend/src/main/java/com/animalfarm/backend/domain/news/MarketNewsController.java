package com.animalfarm.backend.domain.news;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.animalfarm.backend.domain.news.dto.MarketNewsDTO;
import com.animalfarm.backend.global.http.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class MarketNewsController {

	private final MarketNewsRepository newsRepository;
	private final MarketNewsService marketNewsService;

	// 1. 글로벌 뉴스 전체 리스트 조회
	@GetMapping("/global/list")
	public ApiResponse<List<MarketNewsDTO>> getGlobalNewsList() {
		List<MarketNewsDTO> list = newsRepository.selectNewsByType("GLOBAL");
		return ApiResponse.messageWithData("글로벌 뉴스 리스트 조회 성공", list);
	}

	// 2. 글로벌 뉴스 상세 조회 (newsId 기반)
	@GetMapping("/global/{newsId}")
	public ApiResponse<MarketNewsDTO> getGlobalNewsDetail(@PathVariable Long newsId) {
		MarketNewsDTO detail = newsRepository.selectNewsById(newsId);

		if (detail == null) {
			// 커스텀 예외 처리가 있다면 변경하셔도 좋습니다.
			return ApiResponse.messageWithData("해당 뉴스를 찾을 수 없습니다.", null);
		}
		return ApiResponse.messageWithData("글로벌 뉴스 상세 조회 성공", detail);
	}

	// 3. 글로벌 뉴스 실행 (발행)
	@GetMapping("/global/publish")
	public ApiResponse<String> publishGlobalNews() {
		marketNewsService.generateGlobalNews();
		return ApiResponse.messageWithData("글로벌 뉴스 발행 성공", "콘솔 로그를 확인하세요.");
	}
}