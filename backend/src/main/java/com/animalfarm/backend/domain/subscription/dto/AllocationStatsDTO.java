package com.animalfarm.backend.domain.subscription.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class AllocationStatsDTO {
	private BigDecimal maxAmount;           // 최대 신청 금액
	private BigDecimal minAmount;           // 최소 신청 금액
	private BigDecimal totalExcessAmount;    // (Case 2용) 기준액 초과분 총합
	private Long highValueCount;             // (Case 2용) 기준액 이상 신청자 수
	private Long totalCount;                 // 전체 신청자 수
}
