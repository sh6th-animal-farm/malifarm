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
	private String seasonYm;				// 시즌 식별값 Year month: 2025 11
	private LocalDateTime plannedAt;		// 스냅샷 예약 시간 (랜덤)
	private LocalDateTime snapshotAt;		// 실제 스냅샷 완료 시간
	private String status;					// 스냅샷 완료 유무
}
