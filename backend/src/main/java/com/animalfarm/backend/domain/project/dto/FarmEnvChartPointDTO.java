package com.animalfarm.backend.domain.project.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

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
public class FarmEnvChartPointDTO {
	private OffsetDateTime createdAt;
	private BigDecimal temperatureInside;
	private BigDecimal humidityInside;
}
