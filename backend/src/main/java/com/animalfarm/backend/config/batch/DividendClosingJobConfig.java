package com.animalfarm.backend.config.batch;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.batch.MyBatisCursorItemReader;
import org.mybatis.spring.batch.builder.MyBatisCursorItemReaderBuilder;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import com.animalfarm.backend.domain.accounting.DividendService;
import com.animalfarm.backend.domain.accounting.dto.DividendDTO;
import com.animalfarm.backend.domain.accounting.dto.DividendRequestDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DividendClosingJobConfig {

	private final JobRepository jobRepository;
	private final PlatformTransactionManager transactionManager;
	private final SqlSessionFactory sqlSessionFactory;
	private final DividendService dividendService;

	@Bean
	public Job dividendClosingJob() {
		// 2. new JobBuilder(이름, jobRepository) 사용
		return new JobBuilder("dividendClosingJob", jobRepository)
			.start(autoDecideStep())
			.next(sendToBrokerageStep())
			.build();
	}

	// --- Step 1: 미응답자 자동 확정 (Tasklet) ---
	@Bean
	public Step autoDecideStep() {
		// 3. new StepBuilder(이름, jobRepository) 사용
		return new StepBuilder("autoDecideStep", jobRepository)
			.tasklet((contribution, chunkContext) -> RepeatStatus.FINISHED, transactionManager)
			.build();
	}

	// --- Step 2: 증권사 API 전송 (Chunk) ---
	@Bean
	public Step sendToBrokerageStep() {
		return new StepBuilder("sendToBrokerageStep", jobRepository)
			// 4. chunk 설정 시 transactionManager 전달 필수
			.<DividendDTO, DividendRequestDTO>chunk(100, transactionManager)
			.reader(dividendReader())
			.processor((ItemProcessor<DividendDTO, DividendRequestDTO>)DividendRequestDTO::from)
			.writer(dividendClosingWriter())
			.faultTolerant()
			.retry(Exception.class)
			.retryLimit(3)
			.build();
	}

	@Bean
	public MyBatisCursorItemReader<DividendDTO> dividendReader() {
		return new MyBatisCursorItemReaderBuilder<DividendDTO>()
			.sqlSessionFactory(sqlSessionFactory)
			// 5. 패키지 경로 수정: mlf -> backend (ClassNotFound 방지)
			.queryId("com.animalfarm.backend.domain.accounting.DividendRepository.findAllDecidedForApi")
			.build();
	}

	@Bean
	public ItemWriter<DividendRequestDTO> dividendClosingWriter() {
		return items -> {
			// 그룹화하여 전송
			Map<Long, List<DividendRequestDTO>> grouped = items.getItems().stream()
				.collect(Collectors.groupingBy(DividendRequestDTO::getTokenId));

			for (Map.Entry<Long, List<DividendRequestDTO>> entry : grouped.entrySet()) {
				log.info("TokenId: {} 에 대해 {}건 전송 시작", entry.getKey(), entry.getValue().size());

				try {
					dividendService.sendDividendData(entry.getKey(), entry.getValue());
				} catch (Exception e) {
					log.error("API 전송 중 치명적 에러 발생: {}", e.getMessage());
					throw new RuntimeException("증권사 API 전송 실패", e);
				}
			}
		};
		// 전송 후 디비 전송 완료 표시,처리
	}
}