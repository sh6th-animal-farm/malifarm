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

	@Override
	public void write(Chunk<? extends RevenueSummaryDTO> items) throws Exception {
		for (RevenueSummaryDTO summary : items) {
			financesRepo.insertRevenueSummary(summary); // 1. INSERT

			Map<String, Object> params = new HashMap<>();
			params.put("rsId", summary.getRsId());
			params.put("projectId", summary.getProjectId());

			financesRepo.updateRevenueSummaryId(params); // 2. UPDATE Revenue
			financesRepo.updateExpenseSummaryId(params); // 3. UPDATE Expense
		}
	}
}