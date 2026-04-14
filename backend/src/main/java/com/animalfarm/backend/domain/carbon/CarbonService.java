package com.animalfarm.backend.domain.carbon;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.animalfarm.backend.domain.carbon.dto.CarbonDetailDTO;
import com.animalfarm.backend.domain.carbon.dto.CarbonListDTO;
import com.animalfarm.backend.domain.carbon.dto.CarbonOrderCompleteDTO;
import com.animalfarm.backend.domain.carbon.dto.CarbonOrderResponseDTO;
import com.animalfarm.backend.domain.carbon.dto.CarbonSnapshotBalanceDTO;
import com.animalfarm.backend.domain.carbon.dto.UserBenefitDTO;
import com.animalfarm.backend.global.security.SecurityUtil;

import jakarta.transaction.Transactional;

@Service
public class CarbonService {

	private static final BigDecimal HUNDRED = new BigDecimal("100");

	@Autowired
	private CarbonRepository carbonRepository;

	private UserBenefitDTO buildEmptyBenefit(BigDecimal cpPrice) {
		BigDecimal safePrice = cpPrice != null ? cpPrice : BigDecimal.ZERO;

		return UserBenefitDTO.builder() // 기본 혜택값 0세팅
			.userMaxLimit(BigDecimal.ZERO)
			.discountRate(BigDecimal.ZERO)
			.currentPrice(safePrice.setScale(0, RoundingMode.FLOOR))
			.myTokenBalance(BigDecimal.ZERO)
			.build();
	}

	private UserBenefitDTO processCalculation(BigDecimal cpAmount, BigDecimal cpPrice,
		CarbonSnapshotBalanceDTO snapshotBalance) {

		// null 이면 0으로 처리
		BigDecimal safeCpAmount = cpAmount != null ? cpAmount : BigDecimal.ZERO;
		BigDecimal safeCpPrice = cpPrice != null ? cpPrice : BigDecimal.ZERO;

		if (snapshotBalance == null || snapshotBalance.getSharePercent() == null) {
			return buildEmptyBenefit(safeCpPrice); // snapshot 값 없으면 기본 혜택 반환
		}

		BigDecimal sharePercent = snapshotBalance.getSharePercent();
		BigDecimal myTokenBalance = snapshotBalance.getTokenBalance() != null
			? snapshotBalance.getTokenBalance()
			: BigDecimal.ZERO; // snapshopt 에 저장된 지분율과 보유량

		// 최대 구매 가능 수량 계산 (상품 전체 수량 × 내 지분율)
		BigDecimal maxLimit = safeCpAmount.multiply(
			sharePercent.divide(HUNDRED, 10, RoundingMode.HALF_UP)
		).setScale(4, RoundingMode.HALF_UP);

		// reductionSalePolicy 테이블에 할인 정책 불러오기
		BigDecimal discountRate = carbonRepository.getDiscountRate(sharePercent);
		if (discountRate == null) {
			discountRate = BigDecimal.ZERO;
		}

		// 할인 적용 단가 계산
		BigDecimal curPrice = safeCpPrice.multiply(
			BigDecimal.ONE.subtract(discountRate.divide(HUNDRED, 10, RoundingMode.HALF_UP))
		).setScale(0, RoundingMode.FLOOR);

		return UserBenefitDTO.builder()
			.userMaxLimit(maxLimit)
			.discountRate(discountRate)
			.currentPrice(curPrice)
			.myTokenBalance(myTokenBalance)
			.build(); // 계산된 혜택값들 묶어서 반환
	}

	private UserBenefitDTO buildSnapshotBenefit(Long userId, Long tokenId, BigDecimal cpAmount, BigDecimal cpPrice) {
		// 최신 완료된 snapshot_id 조회
		Long snapshotId = carbonRepository.selectLatestCompletedSnapshotId();
		// snapshot이 없거나 user/token 이 없으면 기본 혜택 제공
		if (snapshotId == null || userId == null || tokenId == null) {
			return buildEmptyBenefit(cpPrice);
		}

		// 해당 유저의 해당 토큰 snapshot row(가로,한 줄) 조회
		CarbonSnapshotBalanceDTO snapshotBalance =
			carbonRepository.selectSnapshotBalance(snapshotId, userId, tokenId);

		// 꺼낸 row 줄 processCalculation 메서드에서 혜택 계산
		return processCalculation(cpAmount, cpPrice, snapshotBalance);
	}

	private List<CarbonListDTO> applyBenefitsToList(List<CarbonListDTO> list, Long userId) {
		for (CarbonListDTO item : list) {
			Long tokenId = carbonRepository.getTokenIdByProjectId(item.getProjectId());

			item.setUserBenefit(buildSnapshotBenefit(
				userId,
				tokenId,
				item.getCpAmount(),
				item.getCpPrice()
			));
		}
		return list;
	}

	public List<CarbonListDTO> selectAll() {
		Long userId = SecurityUtil.getCurrentUserId();
		Long snapshotId = carbonRepository.selectLatestCompletedSnapshotId();

		if (snapshotId == null) {
			return new ArrayList<>();
		}
		// snapshot 기준으로 내가 보유한 token 상품만
		List<Long> tokenIds = carbonRepository.selectSnapshotTokenIdsByUserId(snapshotId, userId);
		if (tokenIds == null || tokenIds.isEmpty()) {
			return new ArrayList<>();
		}

		List<CarbonListDTO> list = carbonRepository.selectAll(tokenIds);
		return applyBenefitsToList(list, userId);
	}

	public List<CarbonListDTO> selectByCondition(String category) {
		if (category == null || "ALL".equalsIgnoreCase(category)) {
			return selectAll();
		}

		Long userId = SecurityUtil.getCurrentUserId();
		Long snapshotId = carbonRepository.selectLatestCompletedSnapshotId();

		if (snapshotId == null) {
			return new ArrayList<>();
		}

		List<Long> tokenIds = carbonRepository.selectSnapshotTokenIdsByUserId(snapshotId, userId);
		if (tokenIds == null || tokenIds.isEmpty()) {
			return new ArrayList<>();
		}

		List<CarbonListDTO> list = carbonRepository.selectByCondition(category, tokenIds);
		return applyBenefitsToList(list, userId);
	}

	public CarbonDetailDTO selectDetail(Long cpId) {
		Long userId = SecurityUtil.getCurrentUserId();

		CarbonDetailDTO detail = carbonRepository.selectDetail(cpId);
		if (detail == null || detail.getCarbonInfo() == null) {
			throw new RuntimeException("해당 상품 정보를 찾을 수 없습니다. (ID: " + cpId + ")");
		}

		Long projectId = detail.getCarbonInfo().getProjectId();
		Long tokenId = carbonRepository.getTokenIdByProjectId(projectId);

		detail.setUserBenefit(buildSnapshotBenefit(
			userId,
			tokenId,
			detail.getCarbonInfo().getCpAmount(),
			detail.getCarbonInfo().getCpPrice()
		));

		return detail;
	}

	public CarbonOrderResponseDTO quoteOrder(Long cpId, BigDecimal amount) {
		if (cpId == null) {
			throw new IllegalArgumentException("cpId가 필요합니다.");
		}
		if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
			throw new IllegalArgumentException("amount는 0보다 커야 합니다.");
		}

		Long userId = SecurityUtil.getCurrentUserId();

		CarbonDetailDTO detail = carbonRepository.selectDetail(cpId);
		if (detail == null || detail.getCarbonInfo() == null) {
			throw new RuntimeException("해당 상품 정보를 찾을 수 없습니다. (ID: " + cpId + ")");
		}

		BigDecimal remainAmount = carbonRepository.selectCpAmount(cpId);
		if (remainAmount == null) {
			remainAmount = BigDecimal.ZERO;
		}

		Long projectId = detail.getCarbonInfo().getProjectId();
		Long tokenId = carbonRepository.getTokenIdByProjectId(projectId);

		UserBenefitDTO benefit = buildSnapshotBenefit(
			userId,
			tokenId,
			detail.getCarbonInfo().getCpAmount(),
			detail.getCarbonInfo().getCpPrice()
		);

		BigDecimal unitPrice = benefit.getCurrentPrice();
		BigDecimal discountRate = benefit.getDiscountRate();

		BigDecimal total = unitPrice.multiply(amount).setScale(0, RoundingMode.HALF_UP);
		BigDecimal supply = total.divide(new BigDecimal("1.1"), 0, RoundingMode.FLOOR);
		BigDecimal vat = total.subtract(supply);

		String cpTitle = carbonRepository.selectCpTitle(cpId);

		return CarbonOrderResponseDTO.builder()
			.cpId(cpId)
			.cpTitle(cpTitle)
			.orderAmount(amount)
			.unitPrice(unitPrice)
			.supplyAmount(supply)
			.vatAmount(vat)
			.totalAmount(total)
			.userMaxLimit(benefit.getUserMaxLimit())
			.remainAmount(remainAmount)
			.discountRate(discountRate)
			.build();
	}

	@Transactional
	public void completeOrder(CarbonOrderCompleteDTO req) {
		if (req == null) {
			throw new IllegalArgumentException("요청값이 없습니다.");
		}
		if (req.getCpId() == null) {
			throw new IllegalArgumentException("cpId가 필요합니다.");
		}
		if (req.getAmount() == null || req.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
			throw new IllegalArgumentException("amount는 0보다 커야 합니다.");
		}

		Long userId = SecurityUtil.getCurrentUserId();

		CarbonOrderResponseDTO quote = quoteOrder(req.getCpId(), req.getAmount());
		if (quote == null) {
			throw new RuntimeException("주문 견적 정보가 없습니다.");
		}

		BigDecimal discountedPrice = quote.getTotalAmount();
		BigDecimal discountRate = quote.getDiscountRate();

		int inserted = carbonRepository.insertCarbonHist(
			userId,
			req.getCpId(),
			req.getAmount(),
			discountedPrice,
			discountRate
		);

		if (inserted != 1) {
			throw new RuntimeException("탄소 구매내역 저장에 실패했습니다.");
		}
	}
}