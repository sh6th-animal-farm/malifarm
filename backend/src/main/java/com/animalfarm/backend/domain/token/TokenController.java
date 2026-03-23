package com.animalfarm.backend.domain.token;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.animalfarm.backend.domain.token.dto.CandleDTO;
import com.animalfarm.backend.domain.token.dto.OrderDTO;
import com.animalfarm.backend.domain.token.dto.TokenDTO;
import com.animalfarm.backend.domain.token.dto.TokenSummaryDTO;
import com.animalfarm.backend.domain.token.dto.TokenPendingDTO;
import com.animalfarm.backend.global.dto.ApiResponseDTO;
import com.animalfarm.backend.global.exception.BusinessException;
import com.animalfarm.backend.global.exception.ErrorCode;
import com.animalfarm.backend.global.security.SecurityUtil;

@RestController
public class TokenController {

	@Autowired
	TokenService tokenService;

	@GetMapping("/api/token/{projectId}")
	public ResponseEntity<ApiResponseDTO<TokenDTO>> selectDetail(@PathVariable("projectId") Long projectId) {
		TokenDTO data = tokenService.selectByProjectId(projectId);
		return ResponseEntity.ok(ApiResponseDTO.success(data));
	}

	// 주문 가능 금액 조회
	@GetMapping("/api/account/balance")
	public ResponseEntity<ApiResponseDTO<BigDecimal>> selectCashBalance() {
		Long userId = SecurityUtil.getCurrentUserId();
		if (userId == null) {
			throw new BusinessException(ErrorCode.NEED_LOGIN);
		}

		BigDecimal cashBalance = tokenService.selectCashBalance(userId);
		return ResponseEntity.ok(ApiResponseDTO.success(cashBalance));
	}

	// 보유 토큰 수량 조회
	@GetMapping("/api/account/balance/{tokenId}")
	public ResponseEntity<ApiResponseDTO<BigDecimal>> selectTokenBalance(@PathVariable Long tokenId) {
		Long userId = SecurityUtil.getCurrentUserId();
		if (userId == null) {
			throw new BusinessException(ErrorCode.NEED_LOGIN);
		}

		BigDecimal tokenBalance = tokenService.selectTokenBalance(tokenId, userId);
		return ResponseEntity.ok(ApiResponseDTO.success(tokenBalance));
	}

	// 미체결 내역 조회
	@GetMapping("/api/token/pending/{tokenId}")
	public ResponseEntity<ApiResponseDTO<List<TokenPendingDTO>>> selectAllPending(@PathVariable Long tokenId) {
		Long userId = SecurityUtil.getCurrentUserId();
		if (userId == null) {
			throw new BusinessException(ErrorCode.NEED_LOGIN);
		}

		List<TokenPendingDTO> pendingList = tokenService.selectAllPending(tokenId, userId);
		return ResponseEntity.ok(ApiResponseDTO.success(pendingList));
	}

	// 주문 (매수, 매도)
	@PostMapping("/api/token/order/{tokenId}")
	public ResponseEntity<ApiResponseDTO<Void>> createOrder(@PathVariable Long tokenId, @RequestBody OrderDTO orderDTO) {
		Long userId = SecurityUtil.getCurrentUserId();
		if (userId == null) {
			throw new BusinessException(ErrorCode.NEED_LOGIN);
		}

		tokenService.createOrder(userId, tokenId, orderDTO);
		return ResponseEntity.ok(
			ApiResponseDTO.success(null, "주문이 완료되었습니다.")
		);
	}

	// 주문 취소
	@PostMapping("/api/token/order-cancel/{tokenId}/{orderId}")
	public ResponseEntity<ApiResponseDTO<Void>> cancelOrder(@PathVariable Long tokenId, @PathVariable Long orderId) {
		tokenService.cancelOrder(tokenId, orderId);
		return ResponseEntity.ok(
			ApiResponseDTO.success(null, "주문이 취소되었습니다.")
		);
	}

	// 캔들 조회
	@GetMapping("/api/market/candles/{tokenId}")
	public ResponseEntity<ApiResponseDTO<List<CandleDTO>>> selectCandles(
		@PathVariable Long tokenId,
		@RequestParam(defaultValue = "1") int unit,
		@RequestParam(required = false) Long start,
		@RequestParam(required = false) Long end) {

		List<CandleDTO> candleList = tokenService.selectCandles(tokenId, unit,
			start != null ? start : 0L,
			end != null ? end : System.currentTimeMillis());
		return ResponseEntity.ok(ApiResponseDTO.success(candleList));
	}

	// OHLCV 조회
	@GetMapping("/api/token/ohlcv/{tokenId}")
	public ResponseEntity<ApiResponseDTO<TokenSummaryDTO>> selectTokenOhlcv(@PathVariable Long tokenId) {
		TokenSummaryDTO tokenInfo = tokenService.selectTokenOhlcv(tokenId);
		return ResponseEntity.ok(ApiResponseDTO.success(tokenInfo));
	}

}
