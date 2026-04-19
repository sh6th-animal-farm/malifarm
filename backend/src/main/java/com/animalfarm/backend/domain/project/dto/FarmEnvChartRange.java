package com.animalfarm.backend.domain.project.dto;

public enum FarmEnvChartRange {
	_24H("24h"),
	_7D("7d"),
	_30D("30d");

	private final String value;

	FarmEnvChartRange(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

	public static FarmEnvChartRange from(String value) {
		if (value == null) {
			return _24H;
		}

		for (FarmEnvChartRange range : values()) {
			if (range.value.equalsIgnoreCase(value)) {
				return range;
			}
		}

		return _24H;
	}
}
