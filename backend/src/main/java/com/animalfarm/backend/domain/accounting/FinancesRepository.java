package com.animalfarm.backend.domain.accounting;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import com.animalfarm.backend.domain.accounting.dto.RevenueSummaryDTO;

@Mapper
public interface FinancesRepository {

	// 지출 요약 수정
	void updateExpenseSummaryId(Map<String, Object> params);

	// 수익 요약 수정
	void updateRevenueSummaryId(Map<String, Object> params);

	// 수익 요약 입력
	void insertSummary(RevenueSummaryDTO summary);

	List<Map<String, Object>> selectSettlementTargets(Map<String, Object> params);

	// 수익 요약 조회
	RevenueSummaryDTO selectRevenueSummaryByProjectId(Long projectId);

}
