package com.animalfarm.backend.domain.carbon.dto;

import java.time.LocalDateTime;

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
public class CarbonSnapshotEventDTO {
	private Long snapshotId;
	private String seasonYm;
	private LocalDateTime plannedAt;
	private LocalDateTime snapshotAt;
	private String status;
}
