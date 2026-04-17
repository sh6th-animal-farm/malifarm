package com.animalfarm.backend.domain.news;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class MarketNewsScheduler {

	private final MarketNewsService newsService;

	// 02시, 08시, 14시, 20시 (하루 4회, 6시간 간격)
	@Scheduled(cron = "0 0 2,8,14,20 * * *")
	//@Scheduled(cron = "0 * * * * *")
	public void runGlobalMarketNews() {
		log.info("[Scheduler] 통합 마켓 브리핑 생성 프로세스 시작");
		newsService.generateGlobalNews();
	}
}
