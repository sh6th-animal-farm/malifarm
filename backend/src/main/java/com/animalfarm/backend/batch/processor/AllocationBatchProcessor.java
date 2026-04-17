package com.animalfarm.backend.batch.processor;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.annotation.BeforeStep;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.animalfarm.backend.domain.project.ProjectService;
import com.animalfarm.backend.domain.project.dto.TokenLedgerDTO;
import com.animalfarm.backend.domain.subscription.SubscriptionRepository;
import com.animalfarm.backend.domain.subscription.dto.AllocationIntermediateResult;
import com.animalfarm.backend.domain.subscription.dto.InvestorDTO;
import com.animalfarm.backend.domain.user.dto.WalletDTO;
import com.animalfarm.backend.global.HashManager;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@StepScope
@Slf4j
@RequiredArgsConstructor
public class AllocationBatchProcessor implements ItemProcessor<InvestorDTO, AllocationIntermediateResult> {

	private final SubscriptionRepository subscriptionRepository;
	private final ProjectService projectService;

	// 사용자님 지정 스케일 설정
	private final int MONEY_SCALE = 0;
	private final int TOKEN_SCALE = 4;

	@Value("#{jobParameters['standardAmount']}")
	String standardAmountValue;
	@Value("#{jobParameters['bonusPie']}")
	String bonusPieValue;
	@Value("#{jobParameters['totalExcessAmount']}")
	String totalExcessAmountValue;
	@Value("#{jobParameters['pricePerToken']}")
	String pricePerTokenValue;
	@Value("#{jobParameters['adminTotalBalance']}")
	String adminTotalBalanceValue;
	@Value("#{jobParameters['projectId']}")
	Long projectId;
	@Value("#{jobParameters['tokenId']}")
	Long tokenId;

	private BigDecimal standardAmount;
	private BigDecimal bonusPie;
	private BigDecimal totalExcessAmount;
	private BigDecimal pricePerToken;
	private BigDecimal adminTotalBalance;
	private String lastHash;

	@BeforeStep
	public void init(StepExecution stepExecution) {
		this.standardAmount = new BigDecimal(standardAmountValue);
		this.bonusPie = new BigDecimal(bonusPieValue);
		this.totalExcessAmount = new BigDecimal(totalExcessAmountValue);
		this.pricePerToken = new BigDecimal(pricePerTokenValue);
		this.adminTotalBalance = new BigDecimal(adminTotalBalanceValue);
		String hash = stepExecution.getJobExecution().getJobParameters().getString("lastPrevHash");
		this.lastHash = (hash != null) ? hash : "0";
		log.info("Allocation processor initialized. projectId={}, tokenId={}, standardAmount={}, pricePerToken={}",
			projectId, tokenId, standardAmount, pricePerToken);
		System.out.println("[AllocationBatch] processor initialized. projectId=" + projectId
			+ ", tokenId=" + tokenId
			+ ", standardAmount=" + standardAmount
			+ ", pricePerToken=" + pricePerToken);
	}

	@Override
	public AllocationIntermediateResult process(InvestorDTO investor) {
		// 1. 배정 금액 계산 (Case 1, 2, 3 통합 로직)
		BigDecimal finalAmount = calculateAllocAmount(investor);
		BigDecimal resultTokenCount = finalAmount.divide(pricePerToken, TOKEN_SCALE, RoundingMode.FLOOR);

		// 2. 실시간 지갑 조회
		Long uclId = subscriptionRepository.selectUclId(investor.getUserId());
		if (uclId == null) {
			throw new IllegalStateException(
				"Allocation processing failed: userId=" + investor.getUserId() + " wallet link not found");
		}
		WalletDTO walletInfo = projectService.selectMyWalletInfo(uclId);
		if (walletInfo == null) {
			throw new IllegalStateException("Allocation processing failed: uclId=" + uclId + " wallet lookup returned null");
		}
		if (walletInfo.getTotalBalance() == null) {
			throw new IllegalStateException("Allocation processing failed: uclId=" + uclId + " wallet total balance is null");
		}
		log.info("Processing allocation. userId={}, shId={}, uclId={}, subscriptionAmount={}, finalAmount={}",
			investor.getUserId(), investor.getShId(), uclId, investor.getSubscriptionAmount(), finalAmount);
		System.out.println("[AllocationBatch] processing investor. userId=" + investor.getUserId()
			+ ", shId=" + investor.getShId()
			+ ", uclId=" + uclId
			+ ", subscriptionAmount=" + investor.getSubscriptionAmount()
			+ ", finalAmount=" + finalAmount);

		// 3. 해시 및 트랜잭션 ID 생성
		String timePart = String.valueOf(System.currentTimeMillis());
		String shortTime = timePart.substring(timePart.length() - 6);
		String txId = "SUB_" + projectId + "_" + shortTime;
		String newHash = HashManager.createHash(lastHash, projectId, resultTokenCount);

		// 4. 원본 Builder 로직 적용
		TokenLedgerDTO ledger = TokenLedgerDTO.builder()
			.tokenId(tokenId)
			.fromUserId(1L)
			.toUserId(investor.getUserId())
			.transactionId(txId)
			.externalRefId(990803L) // 임시값
			.orderAmount(investor.getSubscriptionAmount().divide(pricePerToken, TOKEN_SCALE, RoundingMode.FLOOR))
			.contractAmount(resultTokenCount)
			.status("COMPLETED")
			.fee(BigDecimal.ZERO)
			.transactionType("SUBSCRIPTION")
			.from_balanceAfter(adminTotalBalance)
			.to_balanceAfter(walletInfo.getTotalBalance().add(finalAmount))
			.prevHashValue(lastHash)
			.hashValue(newHash)
			.build();

		System.out.println(ledger);
		this.lastHash = newHash;

		return AllocationIntermediateResult.builder()
			.investor(investor).finalAmount(finalAmount).resultTokenCount(resultTokenCount)
			.ledger(ledger).uclId(uclId).projectId(projectId).pricePerToken(pricePerToken).build();
	}

	private BigDecimal calculateAllocAmount(InvestorDTO inv) {
		// Case 2: 비례 배분 로직
		if (bonusPie != null && bonusPie.compareTo(BigDecimal.ZERO) > 0
			&& totalExcessAmount.compareTo(BigDecimal.ZERO) > 0) {
			if (inv.getSubscriptionAmount().compareTo(standardAmount) < 0)
				return inv.getSubscriptionAmount();
			BigDecimal userExcessAmount = inv.getSubscriptionAmount().subtract(standardAmount);
			BigDecimal extraAmount = bonusPie.multiply(userExcessAmount)
				.divide(totalExcessAmount, MONEY_SCALE, RoundingMode.FLOOR);
			return standardAmount.add(extraAmount);
		}
		// Case 1 & 3: 기준액 혹은 신청액 전액
		return inv.getSubscriptionAmount().compareTo(standardAmount) >= 0 ? standardAmount :
			inv.getSubscriptionAmount();
	}
}
