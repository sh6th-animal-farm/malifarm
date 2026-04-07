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

@Component
@StepScope
@RequiredArgsConstructor
public class AllocationBatchProcessor implements ItemProcessor<InvestorDTO, AllocationIntermediateResult> {

	private final SubscriptionRepository subscriptionRepository;
	private final ProjectService projectService;

	// 사용자님 지정 스케일 설정
	private final int MONEY_SCALE = 0;
	private final int TOKEN_SCALE = 4;

	@Value("#{jobExecutionContext['standardAmount']}")
	BigDecimal standardAmount;
	@Value("#{jobExecutionContext['bonusPie']}")
	BigDecimal bonusPie;
	@Value("#{jobExecutionContext['totalExcessAmount']}")
	BigDecimal totalExcessAmount;
	@Value("#{jobExecutionContext['pricePerToken']}")
	BigDecimal pricePerToken;
	@Value("#{jobExecutionContext['adminTotalBalance']}")
	BigDecimal adminTotalBalance;
	@Value("#{jobParameters['projectId']}")
	Long projectId;
	@Value("#{jobParameters['tokenId']}")
	Long tokenId;

	private String lastHash;

	@BeforeStep
	public void init(StepExecution stepExecution) {
		this.lastHash = (String)stepExecution.getJobExecution().getExecutionContext().get("lastPrevHash");
	}

	@Override
	public AllocationIntermediateResult process(InvestorDTO investor) {
		// 1. 배정 금액 계산 (Case 1, 2, 3 통합 로직)
		BigDecimal finalAmount = calculateAllocAmount(investor);
		BigDecimal resultTokenCount = finalAmount.divide(pricePerToken, TOKEN_SCALE, RoundingMode.FLOOR);

		// 2. 실시간 지갑 조회
		Long uclId = subscriptionRepository.selectUclId(investor.getUserId());
		WalletDTO walletInfo = projectService.selectMyWalletInfo(uclId);

		// 3. 해시 및 트랜잭션 ID 생성
		String timePart = String.valueOf(System.currentTimeMillis());
		String shortTime = timePart.substring(timePart.length() - 6);
		String txId = "SUB_" + projectId + "_" + shortTime;
		String newHash = HashManager.createHash(lastHash, tokenId, resultTokenCount);

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