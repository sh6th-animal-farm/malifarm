package com.animalfarm.backend.domain.token;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;

import com.animalfarm.backend.domain.project.dto.TokenLedgerDTO;
import com.animalfarm.backend.domain.token.dto.CandleDTO;
import com.animalfarm.backend.domain.token.dto.OrderDTO;
import com.animalfarm.backend.domain.token.dto.OrderPriceDTO;
import com.animalfarm.backend.domain.token.dto.TokenDTO;
import com.animalfarm.backend.domain.token.dto.TokenDetailDTO;
import com.animalfarm.backend.domain.token.dto.TokenListDTO;
import com.animalfarm.backend.domain.token.dto.TokenPendingDTO;
import com.animalfarm.backend.domain.token.dto.TradePriceDTO;
import com.animalfarm.backend.global.dto.ExternalApiResponseDTO;
import com.animalfarm.backend.global.http.ExternalApiClient;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class TokenService {

	@Autowired
	TokenRepository tokenRepository;

	@Autowired
	ExternalApiClient externalApiClient;

	@Value("${api.kh-stock.url}") // 강황증권 API 서버 주소 (배포)
	private String khUrl;

	// 전체 토큰 시세 조회
	public List<TokenListDTO> selectAll() {
		try {
			List<TokenListDTO> list = externalApiClient.callApi(
				khUrl + "api/market",
				HttpMethod.GET,
				null,
				new ParameterizedTypeReference<ExternalApiResponseDTO<List<TokenListDTO>>>() {}
			);

			list.forEach(dto -> {
				if (dto.getMarketPrice() == null) dto.setMarketPrice(BigDecimal.ZERO);
				if (dto.getDailyTradeVolume() == null) dto.setDailyTradeVolume(BigDecimal.ZERO);
				if (dto.getChangeRate() == null) dto.setChangeRate(BigDecimal.ZERO);
			});

			return list;

		} catch (Exception e) {
			log.error("[Service Error] 토큰 목록 조회 실패: {}",e.getMessage());
			return Collections.emptyList();
		}
	}

	// 토큰 상세 내역 조회
	public TokenDetailDTO selectByTokenId(Long tokenId) {
		String targetUrl = khUrl + "api/my/market/" + tokenId; 	// [TODO] 강황증권 API 필요
		return null;
	}

	// 토큰 차트 조회
	public List<CandleDTO> selectCandles(Long tokenId, int unit, long start, long end) {
		try {
			List<CandleDTO> list = externalApiClient.callApi(
				khUrl + String.format("api/market/candles/%d?unit=%d&start=%d&end=%d", tokenId, unit, start, end),
				HttpMethod.GET,
				null,
				new ParameterizedTypeReference<ExternalApiResponseDTO<List<CandleDTO>>>() {}
			);

			if (list == null || list.isEmpty()) {
				return Collections.emptyList();
			}

			return list.stream()
				.sorted(Comparator.comparingLong(CandleDTO::getCandleTime))
				.collect(Collectors.toList());

		} catch (RuntimeException e) {
			log.error("[Service Error] 토큰 목록 조회 실패: {}",e.getMessage());
			return Collections.emptyList();
		}
	}

	// 토큰 현재가 조회
	public BigDecimal selectCurrentPrice(Long tokenId) {
		BigDecimal curPrice = externalApiClient.callApi(
			khUrl + "api/market/current/" + tokenId,
			HttpMethod.GET,
			null,
			new ParameterizedTypeReference<ExternalApiResponseDTO<BigDecimal>>() {}
		);

		return curPrice;
	}

	// 토큰 존재 여부 확인
	public boolean checkTokenStatus(Long tokenId) {
		Boolean isOk = externalApiClient.callApi(
			khUrl + "api/project/check/" + tokenId,
			HttpMethod.GET,
			null,
			new ParameterizedTypeReference<ExternalApiResponseDTO<Boolean>>() {}
		);

		return isOk;
	}

	// 매수 호가 조회
	public List<OrderPriceDTO> selectAllOrderBuyPrice(Long tokenId) {
		List<OrderPriceDTO> orderBuyPriceList = externalApiClient.callApi(
			khUrl + "api/market/order/buy/" + tokenId,
			HttpMethod.GET,
			null,
			new ParameterizedTypeReference<ExternalApiResponseDTO<List<OrderPriceDTO>>>() {}
		);

		return orderBuyPriceList;
	}

	// 매도 호가 조회
	public List<OrderPriceDTO> selectAllOrderSellPrice(Long tokenId) {
		List<OrderPriceDTO> orderSellPriceList = externalApiClient.callApi(
			khUrl + "api/market/order/sell/" + tokenId,
			HttpMethod.GET,
			null,
			new ParameterizedTypeReference<ExternalApiResponseDTO<List<OrderPriceDTO>>>() {}
		);

		return orderSellPriceList;
	}

	// 체결가 조회
	public List<TradePriceDTO> selectAllTradePrice(Long tokenId) {
		List<TradePriceDTO> tradePriceList = externalApiClient.callApi(
			khUrl + "api/market/trade/" + tokenId,
			HttpMethod.GET,
			null,
			new ParameterizedTypeReference<ExternalApiResponseDTO<List<TradePriceDTO>>>() {}
		);

		return tradePriceList;
	}

	// 증권사 연동 번호 조회 (지갑 번호)
	public Long selectWalletId(Long userId) {
		return tokenRepository.selectWalletId(userId);
	}

	// 주문 가능 금액 조회
	public BigDecimal selectCashBalance(Long userId) {
		Long walletId = selectWalletId(userId);
		if (walletId != null) {
			String targetUrl = khUrl + "api/order/balance/" + walletId;
			BigDecimal cashBalance = externalApiClient.callApi(
				targetUrl,
				HttpMethod.GET,
				null,
				new ParameterizedTypeReference<ExternalApiResponseDTO<BigDecimal>>() {}
			);

			return cashBalance;
		}
		return null;
	}

	// 보유 토큰 수량 조회
	public BigDecimal selectTokenBalance(Long tokenId, Long userId) {
		Long walletId = selectWalletId(userId);
		if (walletId != null) {
			String targetUrl = khUrl + "api/order/balance/" + walletId + "/" + tokenId;
			BigDecimal tokenBalance = externalApiClient.callApi(
				targetUrl,
				HttpMethod.GET,
				null,
				new ParameterizedTypeReference<ExternalApiResponseDTO<BigDecimal>>() {}
			);

			return tokenBalance;
		}
		return null;
	}

	// 미체결 내역 조회
	public List<TokenPendingDTO> selectAllPending(Long tokenId, Long userId) {
		Long walletId = selectWalletId(userId);
		if (walletId != null) {
			String targetUrl = khUrl + "api/market/" + tokenId + "/pending/" + walletId;
			List<TokenPendingDTO> pendingList = externalApiClient.callApi(
				targetUrl,
				HttpMethod.GET,
				null,
				new ParameterizedTypeReference<ExternalApiResponseDTO<List<TokenPendingDTO>>>() {}
			);

			return pendingList;
		}
		return null;
	}

	// 주문 (매수, 매도)
	public boolean createOrder(Long userId, Long tokenId, OrderDTO orderDTO) {
		Long walletId = selectWalletId(userId);
		if (walletId != null) {
			orderDTO.setWalletId(walletId);
			String targetUrl = khUrl + "api/order";

			externalApiClient.callApi(targetUrl,
				HttpMethod.POST,
				orderDTO,
				new ParameterizedTypeReference<ExternalApiResponseDTO<Void>>() {}
			);

			return true;
		}
		return false;
	}

	// 주문 취소
	public boolean cancelOrder(Long tokenId, Long orderId) {
		String targetUrl = khUrl + "api/order/cancel/" + tokenId + "/" + orderId;
		externalApiClient.callApi(
			targetUrl,
			HttpMethod.POST,
			null,
			new ParameterizedTypeReference<ExternalApiResponseDTO<Void>>() {}
		);

		return true;
	}

	public TokenListDTO selectTokenOhlcv(Long tokenId) {
		try {
			TokenListDTO token = externalApiClient.callApi(
				khUrl + "api/market/ohlcv/" + tokenId,
				HttpMethod.GET,
				null,
				new ParameterizedTypeReference<ExternalApiResponseDTO<TokenListDTO>>() {}
			);

			return token; // token이 null인 경우, null 반환

		} catch (Exception e) {
			log.error("[Service Error] 토큰 상세 정보 조회 실패: {}",e.getMessage());
			return null;
		}
	}

	public TokenDTO selectByProjectId(Long projectId) {
		return tokenRepository.selectByProjectId(projectId);
	}

	public void insertTokenLedger(List<TokenLedgerDTO> newTokenList) {
		for (TokenLedgerDTO newToken : newTokenList) {
			tokenRepository.insertTokenLedger(newToken);
		}
	}
}
