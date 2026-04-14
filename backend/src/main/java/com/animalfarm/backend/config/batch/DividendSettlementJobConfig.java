package com.animalfarm.backend.config.batch;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.batch.MyBatisBatchItemWriter;
import org.mybatis.spring.batch.MyBatisPagingItemReader;
import org.mybatis.spring.batch.builder.MyBatisBatchItemWriterBuilder;
import org.mybatis.spring.batch.builder.MyBatisPagingItemReaderBuilder;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.support.ListItemReader;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import com.animalfarm.backend.batch.processor.DividendProcessor;
import com.animalfarm.backend.batch.processor.SettlementProcessor;
import com.animalfarm.backend.batch.writer.SettlementWriter;
import com.animalfarm.backend.domain.accounting.DividendRepository;
import com.animalfarm.backend.domain.accounting.FinancesRepository;
import com.animalfarm.backend.domain.accounting.dto.DividendDTO;
import com.animalfarm.backend.domain.accounting.dto.RevenueSummaryDTO;
import com.animalfarm.backend.domain.accounting.dto.SnapshotResponseDTO;
import com.animalfarm.backend.domain.project.ProjectService;
import com.animalfarm.backend.domain.token.TokenRepository;
import com.animalfarm.backend.global.MailService;

@Configuration
@EnableBatchProcessing
public class DividendSettlementJobConfig {
	@Autowired
	private JobRepository jobRepository;

	@Autowired
	private SqlSessionFactory sqlSessionFactory;

	@Autowired
	private SettlementProcessor settlementProcessor;
	@Autowired
	private SettlementWriter settlementWriter;
	@Autowired
	private FinancesRepository financesRepository;
	@Autowired
	private PlatformTransactionManager transactionManager;
	@Autowired
	private TokenRepository tokenRepository;

	@Autowired
	private ProjectService projectService;
	@Autowired
	private MailService mailService;

	@Autowired
	private DividendRepository dividendRepository;

	@Bean
	@StepScope
	public DividendProcessor dividendProcessor(
		@Value("#{jobParameters[totalAmount]}")
		BigDecimal totalAmount,
		@Value("#{jobParameters[totalIssueVolume]}")
		BigDecimal totalIssueVolume) {

		return new DividendProcessor(totalAmount, totalIssueVolume);
	}

	@Bean
	public Job dividendJob() {
		return new JobBuilder("dividendJob", jobRepository)
			.start(createSummaryStep())
			.next(calculateDividendStep())
			.next(sendEmailStep())
			.build();
	}

	@Bean
	public Step createSummaryStep() {
		return new StepBuilder("createSummaryStep", jobRepository)
			.tasklet((contribution, chunkContext) -> {
				List<RevenueSummaryDTO> summaries = financesRepository.selectSettlementTargets(new HashMap<>())
					.stream()
					.map(item -> {
						try {
							return settlementProcessor.process(item);
						} catch (Exception e) {
							throw new IllegalStateException("Failed to build revenue summary", e);
						}
					})
					.toList();

				settlementWriter.write(new Chunk<>(summaries));
				return RepeatStatus.FINISHED;
			}, transactionManager)
			.build();
	}

	@Bean
	public Step calculateDividendStep() {
		return new StepBuilder("calculateDividendStep", jobRepository)
			.<SnapshotResponseDTO, DividendDTO>chunk(100, transactionManager)
			.reader(dividendListItemReader(null, null, null))
			.processor(dividendProcessor(null, null))
			.writer(dividendJobWriter())
			.build();
	}

	@Bean
	public Step sendEmailStep() {
		return new StepBuilder("sendEmailStep", jobRepository)
			.<DividendDTO, DividendDTO>chunk(10, transactionManager)
			.reader(emailTargetProjectReader(null))
			.writer(emailItemWriter())
			.build();
	}

	@Bean
	public Step sendProjectPendingEmailStep() {
		return new StepBuilder("sendProjectPendingEmailStep", jobRepository)
			.<DividendDTO, DividendDTO>chunk(10, transactionManager)
			.reader(emailTargetProjectReader(null))
			.writer(emailItemWriter())
			.build();
	}

	@Bean
	public MyBatisPagingItemReader<Map<String, Object>> revenueExpenseReader() {
		return new MyBatisPagingItemReaderBuilder<Map<String, Object>>()
			.sqlSessionFactory(sqlSessionFactory)
			.queryId("com.animalfarm.backend.domain.accounting.FinancesRepository.selectSettlementTargets")
			.pageSize(10)
			.build();
	}

	@Bean
	@StepScope
	public ListItemReader<SnapshotResponseDTO> dividendListItemReader(
		@Value("#{jobParameters[projectId]}")
		Long projectId,
		@Value("#{jobParameters[tokenId]}") Long tokenId,
		@Value("#{jobParameters[rsId]}")
		Long rsId) {
		List<SnapshotResponseDTO> snapshot = projectService.getDividendSnapshot(tokenId);

		snapshot.forEach(s -> {
			s.setRsId(rsId);
			s.setProjectId(projectId);
		});

		return new ListItemReader<>(snapshot);
	}

	@Bean
	@StepScope
	public MyBatisPagingItemReader<DividendDTO> emailTargetProjectReader(@Value("#{jobParameters[rsId]}")
	Long rsId) {

		Map<String, Object> parameterValues = new HashMap<>();
		parameterValues.put("rsId", rsId);

		return new MyBatisPagingItemReaderBuilder<DividendDTO>()
			.sqlSessionFactory(sqlSessionFactory)
			.queryId("com.animalfarm.backend.domain.accounting.DividendRepository.selectProjectPollingList")
			.parameterValues(parameterValues)
			.pageSize(10)
			.build();
	}

	@Bean
	public MyBatisBatchItemWriter<DividendDTO> dividendJobWriter() {
		return new MyBatisBatchItemWriterBuilder<DividendDTO>()
			.sqlSessionFactory(sqlSessionFactory)
			.statementId("com.animalfarm.backend.domain.accounting.DividendRepository.insertDividend")
			.build();
	}

	@Bean
	public ItemWriter<DividendDTO> emailItemWriter() {
		return items -> {
			for (DividendDTO item : items) {
				mailService.sendDividendPollEmail(
					item.getUserEmail(),
					item.getUserName(),
					item.getAmountAftTax().toString(),
					item.getPollEndDate().toString(),
					item.getDividendId());

				dividendRepository.updateStatusToPolling(item.getDividendId());

				try {
					Thread.sleep(500);
				} catch (InterruptedException e) {
					Thread.currentThread().interrupt();
				}
			}
		};
	}
}
