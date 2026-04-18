package com.animalfarm.backend.domain.user.dto;

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
public class UserInvestmentLimitDTO {
	private Long userId;
	private String investorType;
	private BigDecimal annualLimit;     // 총 한도
	private BigDecimal usedLimit;       // 사용액
	private BigDecimal availableLimit; // 계산된 잔여 한도
}
