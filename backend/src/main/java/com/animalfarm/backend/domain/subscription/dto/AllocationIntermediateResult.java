package com.animalfarm.backend.domain.subscription.dto;

import java.math.BigDecimal;

import com.animalfarm.backend.domain.project.dto.TokenLedgerDTO;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AllocationIntermediateResult {
	private final InvestorDTO investor;
	private final BigDecimal finalAmount;      // 최종 배정 금액(KRW)
	private final BigDecimal resultTokenCount; // 최종 배정 수량(Token)
	private final TokenLedgerDTO ledger;       // Processor에서 미리 빌드한 원장 객체
	private final Long uclId;
	private final Long projectId;
	private final BigDecimal pricePerToken;
}