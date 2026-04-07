package com.animalfarm.backend.config.batch;

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

@Configuration
@RequiredArgsConstructor
public class AllocationBatchConfig {

	private final JobRepository jobRepository;
	private final PlatformTransactionManager transactionManager;
	private final AllocationBatchProcessor processor;
	private final AllocationBatchWriter writer;
	private final SqlSessionFactory sqlSessionFactory; // MyBatis를 쓰신다면 필요

	//1. Job 설정 배치의 가장 큰 단위입니다. 하나 이상의 Step으로 구성됩니다.
	@Bean
	public Job allocationJob() {
		return new JobBuilder("allocationJob", jobRepository)
			.start(allocationStep())
			.build();
	}

	// 2. Step 설정 실제 작업이 일어나는 단위입니다. Reader -> Processor -> Writer 흐름을 정의
	@Bean
	public Step allocationStep() {
		return new StepBuilder("allocationStep", jobRepository)
			.<InvestorDTO, AllocationIntermediateResult>chunk(1000, transactionManager)
			.reader(investorReader(null)) // 여기서 호출!
			.processor(processor)
			.writer(writer)
			.faultTolerant() // 장애 허용 설정 시작
			.retry(Exception.class) // 에러 발생 시 재시도
			.retryLimit(3) // 최대 3번까지 다시 시도
			.build();
	}

	/**
	 * 3. Reader 설정 (MyBatis 페이징 방식)
	 * DB에서 투자자 목록을 1,000명씩 끊어서 가져오는 역할을 합니다.
	 * * @StepScope: 배치가 실행될 때(런타임) 파라미터를 동적으로 받기 위해 필요합니다.
	 * @Value("#{jobParameters['projectId']}"): 실행 시 외부에서 넘겨준 프로젝트 ID를 주입받습니다.
	 */
	@Bean
	@StepScope
	public MyBatisPagingItemReader<InvestorDTO> investorReader(
		@Value("#{jobParameters['projectId']}") Long projectId) {

		return new MyBatisPagingItemReaderBuilder<InvestorDTO>()
			.sqlSessionFactory(sqlSessionFactory)
			.queryId(
				"com.animalfarm.backend.domain.subscription.SubscriptionRepository.selectInvestorsByProjectId") // 실제 XML Mapper 경로
			.parameterValues(Map.of("projectId", projectId))
			.pageSize(1000)
			.saveState(false)
			.build();
	}
}