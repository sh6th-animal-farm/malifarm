package com.animalfarm.backend.domain.news;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.animalfarm.backend.domain.news.dto.LlmResponseDTO;
import com.animalfarm.backend.domain.news.dto.MarketNewsDTO;
import com.animalfarm.backend.domain.token.dto.CandleDTO;
import com.animalfarm.backend.domain.token.dto.OrderPriceDTO;
import com.animalfarm.backend.domain.token.dto.TokenListDTO;
import com.animalfarm.backend.global.dto.ExternalApiResponseDTO;
import com.animalfarm.backend.global.http.ExternalApiClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MarketNewsService {

	private final ExternalApiClient externalApiClient;
	private final MarketNewsRepository newsRepository;
	private final LlmService llmService;

	// 강황증권 API 베이스 URL
	private final String KH_API_BASE = "https://kh-holdings.cloud";

	// 분석 기준 수치 (기획서 기반 튜닝)
	//private static final BigDecimal MIN_VOL_THRESHOLD = new BigDecimal("0"); // 최소 거래대금 1천만 원, 테스트 10만원
	private static final BigDecimal VOL_SURGE_THRESHOLD = new BigDecimal("0.5");    // 직전 대비 거래량 증가율 50%
	private static final BigDecimal VOLATILITY_THRESHOLD = new BigDecimal("0.03");  // 가격 변동성 3%
	private static final BigDecimal IMBALANCE_THRESHOLD = new BigDecimal("2.0");    // 호가 불균형 2배

	/**
	 * GLOBAL 뉴스 생성
	 */
	@Transactional
	public void generateGlobalNews() {
		try {
			List<TokenListDTO> tokens = fetchAllTokens();
			if (tokens == null || tokens.isEmpty())
				return;

			// ⭐ 핵심: 6시간 사이클을 전반전 3시간 / 후반전 3시간으로 분할
			long endSec = System.currentTimeMillis() / 1000;
			long startSec = endSec - (3 * 60 * 60);       // 최근 3시간 (후반전)
			long prevStartSec = startSec - (3 * 60 * 60); // 직전 3시간 (전반전)

			log.info("[통합 마켓 브리핑] 3H vs 3H 모멘텀 및 자체 등락률 분석 시작");

			// [통계용 변수들]
			BigDecimal totalRecentVol = BigDecimal.ZERO; // 최근 3시간 총 대금
			BigDecimal totalPrevVol = BigDecimal.ZERO;   // 직전 3시간 총 대금
			int upCount = 0;
			int downCount = 0;
			int steadyCount = 0;
			double totalChangeRateSum = 0; // 평균 등락률 계산용
			int validChangeRateCount = 0;
			StringBuilder impactfulTokensReport = new StringBuilder();
			List<String> highlightTokenNamesList = new ArrayList<>(); // UI용 특징주 이름 모음

			// 1. 개별 종목 전수조사 및 통계 집계
			for (TokenListDTO token : tokens) {
				Long id = token.getTokenId();
				try {
					List<CandleDTO> recentCandles = fetchCandles(id, startSec, endSec);
					List<CandleDTO> prevCandles = fetchCandles(id, prevStartSec, startSec);
					List<OrderPriceDTO> buys = fetchBuyOrders(id);
					List<OrderPriceDTO> sells = fetchSellOrders(id);

					BigDecimal recentVol = calculateTotalVolume(recentCandles);
					BigDecimal prevVol = calculateTotalVolume(prevCandles);

					totalRecentVol = totalRecentVol.add(recentVol);
					totalPrevVol = totalPrevVol.add(prevVol);

					// 등락 종목 수 카운트 자체 등락률 직접 계산
					BigDecimal currentChangeRate = BigDecimal.ZERO;

					if (prevCandles != null && !prevCandles.isEmpty() && token.getMarketPrice() != null) {
						// 직전 3시간의 마지막 캔들 종가를 기준가(Baseline)로 잡음
						BigDecimal baselinePrice = prevCandles.get(prevCandles.size() - 1).getClosingPrice();
						BigDecimal currentPrice = token.getMarketPrice(); // 현재가

						if (baselinePrice.compareTo(BigDecimal.ZERO) > 0) {
							// (현재가 - 기준가) / 기준가 * 100
							currentChangeRate = currentPrice.subtract(baselinePrice)
								.divide(baselinePrice, 4, RoundingMode.HALF_UP)
								.multiply(new BigDecimal("100"));
						}
					}

					// 자체 계산한 등락률로 통계 집계
					int compare = currentChangeRate.compareTo(BigDecimal.ZERO);
					if (compare > 0)
						upCount++;
					else if (compare < 0)
						downCount++;
					else
						steadyCount++;

					totalChangeRateSum += currentChangeRate.doubleValue();
					validChangeRateCount++;

					// 특징주(isImpactful) 조건 통과 시
					if (isImpactful(recentCandles, prevVol, recentVol, buys, sells)) {
						double volGrowth = prevVol.compareTo(BigDecimal.ZERO) > 0 ?
							recentVol.subtract(prevVol).divide(prevVol, 2, RoundingMode.HALF_UP).doubleValue() * 100 :
							0;

						impactfulTokensReport.append(String.format("[%s: 3H등락률 %.2f%%, 대금증감률 %.0f%%, 매수잔량 %s/매도잔량 %s] ",
							token.getTokenName(), currentChangeRate.doubleValue(), volGrowth,
							sumOrderVolume(buys).toPlainString(), sumOrderVolume(sells).toPlainString()
						));

						// 💡 UI 위젯에 띄워줄 토큰 이름 수집
						highlightTokenNamesList.add(token.getTokenName());
					}
				} catch (Exception e) {
					log.warn("종목 {} 분석 스킵: {}", id, e.getMessage());
				}
			}

			// =================================================================
			// 2. KOSPI 3대 지표 산출 (지수 등락률, ADR, 거래대금 증감)
			// =================================================================

			// ① 평균 등락률 (전체 토큰의 ChangeRate 평균)
			double averageChangeRate = validChangeRateCount > 0 ? (totalChangeRateSum / validChangeRateCount) : 0.0;

			// ② ADR (등락비율: 상승종목수 / 하락종목수 * 100)
			double adr = (downCount == 0) ? (upCount > 0 ? 200.0 : 100.0) : ((double)upCount / downCount) * 100;

			// ③ 전체 시장 거래대금 증감률 (후반전 3H vs 전반전 3H)
			double marketVolGrowth = 0;
			if (totalPrevVol.compareTo(BigDecimal.ZERO) > 0) {
				marketVolGrowth =
					totalRecentVol.subtract(totalPrevVol).divide(totalPrevVol, 4, RoundingMode.HALF_UP).doubleValue()
						* 100;
			}

			// 3. LLM에게 던져줄 정제된 팩트 데이터 조립
			String factData = String.format(
				"평균등락률:%.2f%%, ADR:%.1f%%, 총거래대금:%s, 전체대금증감률(최근3H vs 직전3H):%.1f%%, [통계] 상승:%d/하락:%d/보합:%d, [특징주(수급/호가쏠림)]: %s",
				averageChangeRate, adr, totalRecentVol.toPlainString(), marketVolGrowth,
				upCount, downCount, steadyCount,
				impactfulTokensReport.length() > 0 ? impactfulTokensReport.toString() : "없음"
			);

			log.info("[통합 분석 완료] LLM 전달 팩트 -> {}", factData);

			LlmResponseDTO llmRes = llmService.ask(factData, "GLOBAL");

			// 💡 UI 위젯이 깨지지 않도록 최대 2개까지만 잘라서 문자열로 조립!
			String highlightTokensStr = highlightTokenNamesList.stream()
				.limit(2)
				.collect(Collectors.joining(", "));

			MarketNewsDTO newsDTO = MarketNewsDTO.builder()
				.newsType("GLOBAL")
				.summaryShort(llmRes.getShortSummary())
				.summaryText(llmRes.getTextBody())
				// 💡 [추가됨] 프론트엔드 UI 위젯이 그대로 가져다 쓸 데이터 직접 삽입!
				.avgChangeRate(averageChangeRate)
				.adrValue(adr)
				.volGrowthRate(marketVolGrowth)
				.highlightTokens(highlightTokensStr)
				.build();

			newsRepository.saveNews(newsDTO);
			log.info("[통합 마켓 브리핑] DB 저장 완료");

		} catch (Exception e) {
			log.error("[통합 시황 실패]: {}", e.getMessage());
		}
	}

	// --- 비즈니스 로직(필터링 및 계산) ---

	private boolean isImpactful(List<CandleDTO> candles, BigDecimal prevVol, BigDecimal recentVol,
		List<OrderPriceDTO> buys, List<OrderPriceDTO> sells) {
		int matchCount = 0;

		log.info("▶ 필터링 검사 시작 [이전 3H 대금: {}, 최근 3H 대금: {}]", prevVol, recentVol);

		// 조건 1. 상대적 거래량 급증 (직전 3H 대비 50% 이상 증가)
		if (prevVol.compareTo(BigDecimal.ZERO) > 0) {
			BigDecimal volIncreaseRate = recentVol.subtract(prevVol)
				.divide(prevVol, 4, RoundingMode.HALF_UP);
			log.info("  - 1. 거래량 증가율: {} (기준치: {})", volIncreaseRate, VOL_SURGE_THRESHOLD);
			if (volIncreaseRate.compareTo(VOL_SURGE_THRESHOLD) >= 0)
				matchCount++;
		} else if (recentVol.compareTo(BigDecimal.ZERO) > 0) {
			log.info("  - 1. 거래량 증가율: 이전 거래 없음 (급증 간주)");
			matchCount++; // 이전 거래량이 0인데 현재 거래량이 발생했다면 급증으로 간주
		}

		// 조건 2. 가격 변동성 (고가-저가 갭)
		BigDecimal high = candles.stream()
			.map(CandleDTO::getHighPrice)
			.max(BigDecimal::compareTo)
			.orElse(BigDecimal.ZERO);
		BigDecimal low = candles.stream()
			.map(CandleDTO::getLowPrice)
			.min(BigDecimal::compareTo)
			.orElse(BigDecimal.ZERO);
		if (low.compareTo(BigDecimal.ZERO) > 0) {
			BigDecimal priceGap = high.subtract(low).divide(low, 4, RoundingMode.HALF_UP);
			log.info("  - 2. 가격 변동성: {} (고가: {}, 저가: {})", priceGap, high, low);
			if (priceGap.compareTo(VOLATILITY_THRESHOLD) >= 0)
				matchCount++;
		}

		// 조건 3. 호가 불균형
		BigDecimal buySum = sumOrderVolume(buys);
		BigDecimal sellSum = sumOrderVolume(sells);
		log.info("  - 3. 호가 잔량 (매수: {}, 매도: {})", buySum, sellSum);
		if (sellSum.compareTo(BigDecimal.ZERO) > 0) {
			BigDecimal ratio = buySum.divide(sellSum, 2, RoundingMode.HALF_UP);
			log.info("  - 3. 매수/매도 비율: {}", ratio);
			if (ratio.compareTo(IMBALANCE_THRESHOLD) >= 0 || ratio.compareTo(new BigDecimal("0.5")) <= 0) {
				matchCount++;
			}
		} else if (buySum.compareTo(BigDecimal.ZERO) > 0) {
			log.info("  - 3. 극단적 불균형: 매도 잔량 0, 매수 대기만 존재 (특징주 조건 충족)");
			matchCount++; // 매도 잔량이 0이고 매수 잔량만 있는 극단적 상황
		}
		log.info("▷ 최종 만족 조건 개수: {}/3 -> {}", matchCount, matchCount >= 2 ? "통과(뉴스발행)" : "탈락(스킵)");
		return matchCount >= 2; // 3개 중 2개 이상 만족 시 true
	}

	// --- External API Call Helpers ---

	private List<TokenListDTO> fetchAllTokens() {
		return externalApiClient.callApi(
			KH_API_BASE + "/api/market", // 전체 토큰 리스트 엔드포인트 수정
			HttpMethod.GET, null,
			new ParameterizedTypeReference<ExternalApiResponseDTO<List<TokenListDTO>>>() {
			}
		);
	}

	private List<CandleDTO> fetchCandles(Long id, long s, long e) {
		return externalApiClient.callApi(
			String.format("%s/api/market/candles/%d?unit=60&start=%d&end=%d", KH_API_BASE, id, s, e),
			HttpMethod.GET, null,
			new ParameterizedTypeReference<ExternalApiResponseDTO<List<CandleDTO>>>() {
			}
		);
	}

	private List<OrderPriceDTO> fetchBuyOrders(Long id) {
		return externalApiClient.callApi(
			KH_API_BASE + "/api/market/order/buy/" + id, // 매수 엔드포인트 분리
			HttpMethod.GET, null,
			new ParameterizedTypeReference<ExternalApiResponseDTO<List<OrderPriceDTO>>>() {
			}
		);
	}

	private List<OrderPriceDTO> fetchSellOrders(Long id) {
		return externalApiClient.callApi(
			KH_API_BASE + "/api/market/order/sell/" + id, // 매도 엔드포인트 분리
			HttpMethod.GET, null,
			new ParameterizedTypeReference<ExternalApiResponseDTO<List<OrderPriceDTO>>>() {
			}
		);
	}

	private BigDecimal calculateTotalVolume(List<CandleDTO> candles) {
		return candles.stream()
			.map(candle -> {
				// 1. API가 tradeAmount(거래대금)를 정상적으로 줬다면 그대로 사용
				if (candle.getTradeAmount() != null) {
					return candle.getTradeAmount();
				}

				// 2. tradeAmount가 null이라면? -> (거래량 * 종가)로 직접 거래대금 계산!
				if (candle.getTradeVolume() != null && candle.getClosingPrice() != null) {
					return candle.getTradeVolume().multiply(candle.getClosingPrice());
				}

				// 둘 다 없으면 0원 처리
				return BigDecimal.ZERO;
			})
			.reduce(BigDecimal.ZERO, BigDecimal::add);
	}

	private BigDecimal sumOrderVolume(List<OrderPriceDTO> orders) {
		if (orders == null)
			return BigDecimal.ZERO;
		return orders.stream().map(OrderPriceDTO::getTotalVolume)
			.filter(vol -> vol != null)
			.reduce(BigDecimal.ZERO, BigDecimal::add);
	}

	private String buildTokenFactData(TokenListDTO token, BigDecimal recentVol, BigDecimal prevVol,
		List<OrderPriceDTO> buys, List<OrderPriceDTO> sells) {
		return String.format("종목명:%s, 현재가:%s, 직전3H-대금:%s, 최근3H-대금:%s, 매수잔량:%s, 매도잔량:%s",
			token.getTokenName(), token.getMarketPrice(), prevVol.toPlainString(), recentVol.toPlainString(),
			sumOrderVolume(buys).toPlainString(), sumOrderVolume(sells).toPlainString());
	}
}