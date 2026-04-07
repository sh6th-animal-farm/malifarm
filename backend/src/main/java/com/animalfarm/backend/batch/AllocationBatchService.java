package com.animalfarm.backend.batch;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.stereotype.Service;

import com.animalfarm.backend.domain.project.ProjectService;
import com.animalfarm.backend.domain.subscription.SubscriptionRepository;
import com.animalfarm.backend.domain.subscription.dto.AllocationStatsDTO;
import com.animalfarm.backend.domain.subscription.dto.AllocationTokenDTO;
import com.animalfarm.backend.domain.token.TokenRepository;
import com.animalfarm.backend.domain.user.dto.WalletDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AllocationBatchService {
	private final JobLauncher jobLauncher;
	private final Job allocationJob;
	private final SubscriptionRepository subscriptionRepository;
	private final ProjectService projectService;
	private final TokenRepository tokenRepository;

	public void runAllocationBatch(Long inprogressProjectId) throws Exception {
		AllocationTokenDTO dto = subscriptionRepository.selectAllocationInfo(inprogressProjectId);

		final int MONEY_SCALE = 0;
		BigDecimal standardAmount = ((dto.getTargetAmount()
			.divide(dto.getSubscriberCount(), MONEY_SCALE, RoundingMode.FLOOR))
			.max(dto.getMinAmountPerInvestor()));

		AllocationStatsDTO status = subscriptionRepository.selectAllocationStats(inprogressProjectId, standardAmount);

		// 보너스 파이 계산
		BigDecimal bonusPie = dto.getTargetAmount()
			.subtract(status.getMinorTotalAmount())
			.subtract(standardAmount.multiply(new BigDecimal(status.getHighValueCount())));

		String lastPrevHash = tokenRepository.selectLastHash();
		WalletDTO adminWallet = projectService.selectMyWalletInfo(1L);
		BigDecimal pricePerToken = dto.getTargetAmount().divide(dto.getTotalSupply(), 10, RoundingMode.FLOOR);

		// 배치 실행 및 컨텍스트 주입
		JobParameters params = new JobParametersBuilder()
			.addLong("projectId", dto.getProjectId())
			.addLong("tokenId", dto.getTokenId())
			.addLong("runTime", System.currentTimeMillis())
			.toJobParameters();

		// Step에서 사용할 수 있도록 ExecutionContext에 저장하는 로직이 JobConfig에 포함되어야 함
		jobLauncher.run(allocationJob, params);
	}
}