package com.animalfarm.backend.config.batch;

import java.util.HashMap;
import java.util.Map;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.batch.MyBatisPagingItemReader;
import org.mybatis.spring.batch.builder.MyBatisPagingItemReaderBuilder;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import com.animalfarm.backend.batch.processor.AllocationBatchProcessor;
import com.animalfarm.backend.batch.writer.AllocationBatchWriter;
import com.animalfarm.backend.domain.subscription.dto.AllocationIntermediateResult;
import com.animalfarm.backend.domain.subscription.dto.InvestorDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
@RequiredArgsConstructor
public class AllocationBatchConfig {

	private final JobRepository jobRepository;
	private final PlatformTransactionManager transactionManager;
	private final AllocationBatchProcessor processor;
	private final AllocationBatchWriter writer;
	private final SqlSessionFactory sqlSessionFactory;

	@Bean
	public Job allocationJob(Step allocationStep) {
		System.out.println("[AllocationBatch] allocationJob bean initialized");
		return new JobBuilder("allocationJob", jobRepository)
			.start(allocationStep)
			.build();
	}

	@Bean
	public Step allocationStep(MyBatisPagingItemReader<InvestorDTO> investorReader) {
		System.out.println("[AllocationBatch] allocationStep bean initialized");
		return new StepBuilder("allocationStep", jobRepository)
			.<InvestorDTO, AllocationIntermediateResult>chunk(1000, transactionManager)
			.reader(investorReader)
			.processor(processor)
			.writer(writer)
			.faultTolerant()
			.retry(Exception.class)
			.retryLimit(3)
			.build();
	}

	@Bean
	@StepScope
	public MyBatisPagingItemReader<InvestorDTO> investorReader(
		@Value("#{jobParameters['projectId']}") Long projectId) {

		if (projectId == null) {
			throw new IllegalStateException("Allocation reader initialization failed: projectId job parameter is null");
		}

		Map<String, Object> parameterValues = new HashMap<>();
		parameterValues.put("projectId", projectId);
		log.info("Initializing allocation reader. projectId={}", projectId);
		System.out.println("[AllocationBatch] reader initialized. projectId=" + projectId);

		return new MyBatisPagingItemReaderBuilder<InvestorDTO>()
			.sqlSessionFactory(sqlSessionFactory)
			.queryId("com.animalfarm.backend.domain.subscription.SubscriptionRepository.selectInvestorsByProjectId")
			.parameterValues(parameterValues)
			.pageSize(1000)
			.saveState(false)
			.build();
	}
}
