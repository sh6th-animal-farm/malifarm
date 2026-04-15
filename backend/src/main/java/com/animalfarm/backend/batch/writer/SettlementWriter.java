package com.animalfarm.backend.batch.writer;

import java.util.HashMap;
import java.util.Map;

import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;

import com.animalfarm.backend.domain.accounting.FinancesRepository;
import com.animalfarm.backend.domain.accounting.dto.RevenueSummaryDTO;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SettlementWriter implements ItemWriter<RevenueSummaryDTO> {

	private final FinancesRepository financesRepo;
	//private final SqlSessionTemplate sqlSessionTemplate;

	@Override
	public void write(Chunk<? extends RevenueSummaryDTO> items) throws Exception {
		for (RevenueSummaryDTO summary : items) {
			//sqlSessionTemplate.insert("com.animalfarm.backend.domain.accounting.FinancesRepository.insertSummary", summary);
			financesRepo.insertSummary(summary); // 1. INSERT

			Map<String, Object> params = new HashMap<>();
			params.put("rsId", summary.getRsId());
			params.put("projectId", summary.getProjectId());

			//sqlSessionTemplate.update(
			//"com.animalfarm.backend.domain.accounting.FinancesRepository.updateRevenueSummaryId", params);
			//sqlSessionTemplate.update(
			//"com.animalfarm.backend.domain.accounting.FinancesRepository.updateExpenseSummaryId", params);
			financesRepo.updateRevenueSummaryId(params); // 2. UPDATE Revenue
			financesRepo.updateExpenseSummaryId(params); // 3. UPDATE Expense
		}
	}
}