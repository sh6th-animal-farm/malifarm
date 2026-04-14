package com.animalfarm.backend.domain.carbon;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.animalfarm.backend.domain.carbon.dto.CarbonDiscountDTO;
import com.animalfarm.backend.domain.carbon.dto.CarbonSnapshotEventDTO;
import com.animalfarm.backend.global.dto.ExternalApiResponseDTO;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class CarbonSnapshotBatchService {

	private static final BigDecimal HUNDRED = new BigDecimal("100");

	@Autowired
	private CarbonRepository carbonRepository;

	@Autowired
	private RestTemplate restTemplate;

	@Value("${api.kh-stock.url}")
	private String khUrl;

	/**
	 * 11월 마다 예정된 스냅샷 이벤트가 있는지 확인
	 */
	@Scheduled(cron = "0 0 * * 11 *")
	public void runScheduledSnapshot() {
		CarbonSnapshotEventDTO event = carbonRepository.selectPlannedSnapshotEvent(LocalDateTime.now());

		// 11월에 매시간마다 실행 후 이벤트가 없으면 return
		if (event == null) {
			return;
		}

		log.info("스냅샷 배치 시작 - snapshotId={}, seasonYm={}", event.getSnapshotId(), event.getSeasonYm());

		try {
			// 이벤트 상태를 Running 으로 바꾸고
			carbonRepository.updateSnapshotEventStatus(event.getSnapshotId(), "RUNNING", null);
			// 전체 snapshot 생성
			createSnapshotBalances(event.getSnapshotId());
			// 다 끝나면 Comlieted로 변경 후 snapshot 저장
			carbonRepository.updateSnapshotEventStatus(
				event.getSnapshotId(),
				"COMPLETED",
				LocalDateTime.now()
			);

			log.info("스냅샷 배치 완료 - snapshotId={}", event.getSnapshotId());
		} catch (Exception e) {
			log.error("스냅샷 배치 실패 - snapshotId={}", event.getSnapshotId(), e);

			carbonRepository.updateSnapshotEventStatus(
				event.getSnapshotId(),
				"FAILED",
				null
			);
		}
	}

	@Transactional
	public void createSnapshotBalances(Long snapshotId) {
		// 기업 회원 전체 조회
		List<Long> enterpriseUserIds = carbonRepository.selectEnterpriseUserIds();

		// 각 유저마다 지갑 조회하고
		for (Long userId : enterpriseUserIds) {
			Long walletId = carbonRepository.getWalletIdByUserId(userId);
			// 없으면 skip
			if (walletId == null) {
				log.warn("지갑 정보 없음 - userId={}", userId);
				continue;
			}
			// 지갑 존재하면 외부 api(강황 증권)로 조회
			List<CarbonDiscountDTO> holdings = fetchAllHoldings(walletId);

			if (holdings == null || holdings.isEmpty()) {
				continue;
			}
			// 각 holding 마다 반복하여
			for (CarbonDiscountDTO holding : holdings) {
				// tokenid 없으면 skip
				if (holding.getTokenId() == null) {
					continue;
				}

				BigDecimal myBalance = holding.getMyBalance() != null
					? holding.getMyBalance()
					: BigDecimal.ZERO;
				// 내가 가진 토큰 수 0이면 스킵
				if (myBalance.compareTo(BigDecimal.ZERO) <= 0) {
					continue;
				}

				// 총 발행량 조회해서
				BigDecimal totalSupply = carbonRepository.getTotalSupplyByTokenId(holding.getTokenId());
				if (totalSupply == null || totalSupply.compareTo(BigDecimal.ZERO) <= 0) {
					log.warn("총발행량 없음 - tokenId={}", holding.getTokenId());
					continue;
				}

				// 지분률 계산
				BigDecimal sharePercent = myBalance
					.divide(totalSupply, 10, RoundingMode.HALF_UP)
					.multiply(HUNDRED)
					.setScale(6, RoundingMode.HALF_UP);

				// 탄소 스냅샷 내역 테이블에 저장
				int inserted = carbonRepository.insertSnapshotBalance(
					snapshotId,
					userId,
					walletId,
					holding.getTokenId(),
					myBalance,
					totalSupply,
					sharePercent
				);

				if (inserted != 1) {
					throw new RuntimeException(
						"스냅샷 balance 저장 실패 - userId=" + userId + ", tokenId=" + holding.getTokenId());
				}
			}
		}
	}

	// 외부 증권사(강황증권) 호출 메서드
	private List<CarbonDiscountDTO> fetchAllHoldings(Long walletId) {
		try {
			String url = khUrl + "/api/carbon/" + walletId;

			ResponseEntity<ExternalApiResponseDTO<List<CarbonDiscountDTO>>> responseEntity = restTemplate.exchange(
				url,
				HttpMethod.GET,
				null,
				new ParameterizedTypeReference<ExternalApiResponseDTO<List<CarbonDiscountDTO>>>() {
				}
			);

			ExternalApiResponseDTO<List<CarbonDiscountDTO>> response = responseEntity.getBody();

			if (response != null && response.getPayload() != null) {
				return response.getPayload();
			}

			return new ArrayList<>();
		} catch (Exception e) {
			log.error("외부 증권사 holdings 조회 실패 - walletId={}", walletId, e);
			return new ArrayList<>();
		}
	}
}