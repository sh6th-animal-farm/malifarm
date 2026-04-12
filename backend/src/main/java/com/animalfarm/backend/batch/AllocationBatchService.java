package com.animalfarm.backend.batch;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
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
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class AllocationBatchService {
	private final JobLauncher jobLauncher;
	private final Job allocationJob;
	private final SubscriptionRepository subscriptionRepository;
	private final ProjectService projectService;
	private final TokenRepository tokenRepository;

	public void runAllocationBatch(Long inprogressProjectId) throws Exception {
		System.out.println("[AllocationBatch] runAllocationBatch called. projectId=" + inprogressProjectId);
		AllocationTokenDTO dto = subscriptionRepository.selectAllocationInfo(inprogressProjectId);
		if (dto == null) {
			throw new IllegalStateException("Allocation batch start failed: projectId=" + inprogressProjectId
				+ " allocation info not found");
		}

		final int MONEY_SCALE = 0;
		BigDecimal standardAmount = ((dto.getTargetAmount()
			.divide(dto.getSubscriberCount(), MONEY_SCALE, RoundingMode.FLOOR))
			.max(dto.getMinAmountPerInvestor()));

		AllocationStatsDTO status = subscriptionRepository.selectAllocationStats(inprogressProjectId, standardAmount);
		if (status == null) {
			throw new IllegalStateException("Allocation batch start failed: projectId=" + inprogressProjectId
				+ " allocation stats not found");
		}

		// 보너스 파이 계산
		BigDecimal bonusPie = dto.getTargetAmount()
			.subtract(status.getMinorTotalAmount())
			.subtract(standardAmount.multiply(new BigDecimal(status.getHighValueCount())));

		String lastPrevHash = tokenRepository.selectLastHash();
		WalletDTO adminWallet = projectService.selectMyWalletInfo(1L);
		if (adminWallet == null) {
			throw new IllegalStateException("Allocation batch start failed: admin wallet lookup returned null");
		}
		if (adminWallet.getTotalBalance() == null) {
			throw new IllegalStateException("Allocation batch start failed: admin wallet total balance is null");
		}
		BigDecimal pricePerToken = dto.getTargetAmount().divide(dto.getTotalSupply(), 10, RoundingMode.FLOOR);
		log.info("Starting allocation batch. projectId={}, tokenId={}, subscriberCount={}, pricePerToken={}",
			dto.getProjectId(), dto.getTokenId(), dto.getSubscriberCount(), pricePerToken);
		System.out.println("[AllocationBatch] launching job. projectId=" + dto.getProjectId()
			+ ", tokenId=" + dto.getTokenId()
			+ ", subscriberCount=" + dto.getSubscriberCount()
			+ ", pricePerToken=" + pricePerToken);

		// 배치 실행 및 컨텍스트 주입
		JobParameters params = new JobParametersBuilder()
			.addLong("projectId", dto.getProjectId())
			.addLong("tokenId", dto.getTokenId())
			.addLong("runTime", System.currentTimeMillis())
			.addString("standardAmount", standardAmount.toPlainString())
			.addString("bonusPie", bonusPie.toPlainString())
			.addString("totalExcessAmount", status.getTotalExcessAmount().toPlainString())
			.addString("pricePerToken", pricePerToken.toPlainString())
			.addString("adminTotalBalance", adminWallet.getTotalBalance().toPlainString())
			.addString("lastPrevHash", lastPrevHash)
			.toJobParameters();

		// Step에서 사용할 수 있도록 ExecutionContext에 저장하는 로직이 JobConfig에 포함되어야 함
		JobExecution execution = jobLauncher.run(allocationJob, params);
		System.out.println("[AllocationBatch] job finished. jobId=" + execution.getJobId()
			+ ", status=" + execution.getStatus()
			+ ", exitStatus=" + execution.getExitStatus());
	}
}
