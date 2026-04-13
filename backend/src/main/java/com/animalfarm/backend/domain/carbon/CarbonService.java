package com.animalfarm.backend.domain.carbon;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.animalfarm.backend.domain.carbon.dto.CarbonDetailDTO;
import com.animalfarm.backend.domain.carbon.dto.CarbonDiscountDTO;
import com.animalfarm.backend.domain.carbon.dto.CarbonListDTO;
import com.animalfarm.backend.domain.carbon.dto.CarbonOrderCompleteDTO;
import com.animalfarm.backend.domain.carbon.dto.CarbonOrderResponseDTO;
import com.animalfarm.backend.domain.carbon.dto.UserBenefitDTO;
import com.animalfarm.backend.global.dto.ExternalApiResponseDTO;
import com.animalfarm.backend.global.security.SecurityUtil;

import jakarta.transaction.Transactional;

@Service
public class CarbonService {

	private static final BigDecimal HUNDRED = new BigDecimal("100");

	@Autowired
	private CarbonRepository carbonRepository;

	@Autowired
	private RestTemplate restTemplate;

	@Value("${api.kh-stock.url}")
	private String khUrl;

	public List<CarbonDiscountDTO> fetchAllHoldings(Long walletId) {
		try {
			String url = khUrl + "/api/carbon/" + walletId;
			ResponseEntity<ExternalApiResponseDTO<List<CarbonDiscountDTO>>> responseEntity = restTemplate.exchange(
				url,
				HttpMethod.GET,
				null,
				new ParameterizedTypeReference<ExternalApiResponseDTO<List<CarbonDiscountDTO>>>() {
				});

			ExternalApiResponseDTO<List<CarbonDiscountDTO>> response = responseEntity.getBody();
			if (response != null && response.getPayload() != null) {
				return response.getPayload();
			}
			return new ArrayList<>();
		} catch (Exception e) {
			return new ArrayList<>();
		}
	}

	private BigDecimal resolveDiscountRate(Long userId, Long tokenId) {
		Long snapshotId = carbonRepository.selectLatestCompletedSnapshotId();
		if (snapshotId == null || userId == null || tokenId == null) {
			return BigDecimal.ZERO;
		}

		BigDecimal sharePercent = carbonRepository.selectSnapshotSharePercent(snapshotId, userId, tokenId);
		if (sharePercent == null) {
			return BigDecimal.ZERO;
		}

		BigDecimal discountRate = carbonRepository.getDiscountRate(sharePercent);
		return discountRate != null ? discountRate : BigDecimal.ZERO;
	}

	private UserBenefitDTO processCalculation(Long userId, Long tokenId, BigDecimal cpAmount, BigDecimal cpPrice,
		CarbonDiscountDTO balance) {
		BigDecimal safeCpAmount = cpAmount != null ? cpAmount : BigDecimal.ZERO;
		BigDecimal safeCpPrice = cpPrice != null ? cpPrice : BigDecimal.ZERO;
		BigDecimal myBal = (balance != null && balance.getMyBalance() != null) ? balance.getMyBalance() : BigDecimal.ZERO;
		BigDecimal totalCorpTokens = (balance != null && balance.getEnterpriseTotal() != null)
			? balance.getEnterpriseTotal()
			: BigDecimal.ONE;

		if (totalCorpTokens.compareTo(BigDecimal.ZERO) == 0) {
			totalCorpTokens = BigDecimal.ONE;
		}

		BigDecimal limitShareRatio = myBal.divide(totalCorpTokens, 10, RoundingMode.HALF_UP);
		BigDecimal maxLimit = safeCpAmount.multiply(limitShareRatio).setScale(4, RoundingMode.HALF_UP);
		BigDecimal discountRate = resolveDiscountRate(userId, tokenId);

		BigDecimal curPrice = safeCpPrice.multiply(
			BigDecimal.ONE.subtract(discountRate.divide(HUNDRED, 10, RoundingMode.HALF_UP)));

		return UserBenefitDTO.builder()
			.userMaxLimit(maxLimit)
			.discountRate(discountRate)
			.currentPrice(curPrice.setScale(0, RoundingMode.FLOOR))
			.myTokenBalance(myBal)
			.build();
	}

	private List<Long> extractMyTokenIds(List<CarbonDiscountDTO> holdings) {
		return holdings.stream()
			.filter(h -> h.getTokenId() != null && h.getMyBalance() != null && h.getMyBalance().compareTo(BigDecimal.ZERO) > 0)
			.map(CarbonDiscountDTO::getTokenId)
			.collect(Collectors.toList());
	}

	private List<CarbonListDTO> applyBenefitsToList(List<CarbonListDTO> list, List<CarbonDiscountDTO> holdings, Long userId) {
		for (CarbonListDTO item : list) {
			Long tokenId = carbonRepository.getTokenIdByProjectId(item.getProjectId());

			CarbonDiscountDTO myHolding = holdings.stream()
				.filter(h -> h.getTokenId() != null && h.getTokenId().equals(tokenId))
				.findFirst().orElse(null);

			item.setUserBenefit(processCalculation(
				userId,
				tokenId,
				item.getCpAmount(),
				item.getCpPrice(),
				myHolding));
		}
		return list;
	}

	public List<CarbonListDTO> selectAll() {
		Long userId = SecurityUtil.getCurrentUserId();
		Long walletId = carbonRepository.getWalletIdByUserId(userId);
		List<CarbonDiscountDTO> holdings = fetchAllHoldings(walletId);

		List<Long> myTokenIds = extractMyTokenIds(holdings);
		if (myTokenIds.isEmpty()) {
			return new ArrayList<>();
		}

		List<CarbonListDTO> list = carbonRepository.selectAll(myTokenIds);
		return applyBenefitsToList(list, holdings, userId);
	}

	public List<CarbonListDTO> selectByCondition(String category) {
		if (category == null || "ALL".equalsIgnoreCase(category)) {
			return selectAll();
		}

		Long userId = SecurityUtil.getCurrentUserId();
		Long walletId = carbonRepository.getWalletIdByUserId(userId);
		List<CarbonDiscountDTO> holdings = fetchAllHoldings(walletId);

		List<Long> myTokenIds = extractMyTokenIds(holdings);
		if (myTokenIds.isEmpty()) {
			return new ArrayList<>();
		}

		List<CarbonListDTO> list = carbonRepository.selectByCondition(category, myTokenIds);
		return applyBenefitsToList(list, holdings, userId);
	}

	public CarbonDetailDTO selectDetail(Long cpId) {
		Long userId = SecurityUtil.getCurrentUserId();
		Long walletId = carbonRepository.getWalletIdByUserId(userId);

		CarbonDetailDTO detail = carbonRepository.selectDetail(cpId);
		if (detail == null || detail.getCarbonInfo() == null) {
			throw new RuntimeException("해당 상품 정보를 찾을 수 없습니다. (ID: " + cpId + ")");
		}

		Long projectId = detail.getCarbonInfo().getProjectId();
		Long tokenId = carbonRepository.getTokenIdByProjectId(projectId);

		List<CarbonDiscountDTO> holdings = fetchAllHoldings(walletId);
		CarbonDiscountDTO myHolding = holdings.stream()
			.filter(h -> h.getTokenId() != null && h.getTokenId().equals(tokenId))
			.findFirst()
			.orElse(null);

		detail.setUserBenefit(processCalculation(
			userId,
			tokenId,
			detail.getCarbonInfo().getCpAmount(),
			detail.getCarbonInfo().getCpPrice(),
			myHolding));

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
		Long walletId = carbonRepository.getWalletIdByUserId(userId);

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

		List<CarbonDiscountDTO> holdings = fetchAllHoldings(walletId);
		CarbonDiscountDTO myHolding = holdings.stream()
			.filter(h -> h.getTokenId() != null && h.getTokenId().equals(tokenId))
			.findFirst()
			.orElse(null);

		UserBenefitDTO benefit = processCalculation(
			userId,
			tokenId,
			detail.getCarbonInfo().getCpAmount(),
			detail.getCarbonInfo().getCpPrice(),
			myHolding);

		BigDecimal unitPrice = (benefit != null && benefit.getCurrentPrice() != null)
			? benefit.getCurrentPrice()
			: detail.getCarbonInfo().getCpPrice();

		BigDecimal discountRate = (benefit != null && benefit.getDiscountRate() != null)
			? benefit.getDiscountRate()
			: BigDecimal.ZERO;

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
			.userMaxLimit(benefit != null ? benefit.getUserMaxLimit() : null)
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
			discountRate);

		if (inserted != 1) {
			throw new RuntimeException("탄소 구매내역 저장에 실패했습니다.");
		}
	}
}
