package com.animalfarm.backend.domain.carbon.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarbonSnapshotBalanceDTO {
	private Long snapshotId;
	private Long userId;
	private Long walletId;
	private Long tokenId;
	private BigDecimal tokenBalance;
	private BigDecimal totalSupply;
	private BigDecimal sharePercent;
}
