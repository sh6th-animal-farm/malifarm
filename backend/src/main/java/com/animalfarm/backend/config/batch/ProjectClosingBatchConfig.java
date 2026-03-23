package com.animalfarm.backend.config.batch;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.support.ListItemReader;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import com.animalfarm.backend.batch.processor.RefundAfterBurnProcessor;
import com.animalfarm.backend.batch.writer.ProjectClosingWriter;
import com.animalfarm.backend.domain.accounting.dto.RefundTokenLedgerDTO;
import com.animalfarm.backend.domain.project.ProjectClosingService;
import com.animalfarm.backend.domain.refund.RefundDTO;
import com.animalfarm.backend.domain.token.TokenBurnTasklet;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class ProjectClosingBatchConfig {

	private final JobRepository jobRepository;
	private final PlatformTransactionManager transactionManager;
	private final TokenBurnTasklet tokenBurnTasklet;
	private final ProjectClosingWriter projectClosingWriter;
	private final RefundAfterBurnProcessor refundProcessor;

	private final ProjectClosingService projectClosingService;
	private final Step calculateDividendStep;
	private final Step sendProjectPendingEmailStep;

	@Bean
	public Job projectClosingJob() {
		// 2. JobBuilder 사용
		return new JobBuilder("projectClosingJob", jobRepository)
			.start(calculateDividendStep)        // 1. 배당금 계산
			.next(sendProjectPendingEmailStep)  // 2. 이메일 전송
			.next(requestTokenBurnStep())        // 3. 소각 API (순서 번호 조정됨)
			.next(updateFinalStatusStep())       // 4. 환불 내역, 토큰 원장 기록
			.next(completeProjectStep())         // 5. 프로젝트 상태 변경
			.build();
	}

	// 토큰 소각 API 요청 (Tasklet 방식)
	@Bean
	public Step requestTokenBurnStep() {
		// 3. StepBuilder 사용 및 트랜잭션 매니저 지정
		return new StepBuilder("requestTokenBurnStep", jobRepository)
			.tasklet(tokenBurnTasklet, transactionManager)
			.build();
	}

	// DB 최종 정리
	@Bean
	public Step updateFinalStatusStep() {
		return new StepBuilder("updateFinalStatusStep", jobRepository)
			// 4. chunk 설정 시 transactionManager 필수
			.<RefundDTO, RefundTokenLedgerDTO>chunk(100, transactionManager)
			.reader(refundListReader(null))
			.processor(refundProcessor)
			.writer(projectClosingWriter)
			.build();
	}

	@Bean
	public Step completeProjectStep() {
		return new StepBuilder("completeProjectStep", jobRepository)
			.tasklet((contribution, chunkContext) -> {
				// JobParameters에서 데이터 추출
				Map<String, Object> jobParams = chunkContext.getStepContext().getJobParameters();
				Long projectId = Long.valueOf(jobParams.get("projectId").toString());
				Long tokenId = Long.valueOf(jobParams.get("tokenId").toString());

				log.info(">>> 프로젝트 {} 상태를 COMPLETED로 변경합니다.", projectId);
				projectClosingService.updateProjectAndTokenStatus(projectId, tokenId);
				return RepeatStatus.FINISHED;
			}, transactionManager) // 트랜잭션 매니저 추가
			.build();
	}

	@Bean
	@StepScope
	public ListItemReader<RefundDTO> refundListReader(
		@Value("#{jobExecutionContext['refundList']}") List<RefundDTO> refundList) {
		return new ListItemReader<>(refundList != null ? refundList : new ArrayList<>());
	}
}