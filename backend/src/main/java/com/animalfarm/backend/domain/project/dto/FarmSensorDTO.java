package com.animalfarm.backend.domain.project.dto;

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
public class FarmSensorDTO {
	private String standardCategory;
	private String standardElement;
	private String measDate;
	private String fatrCode;
	private String standardType;
	private String facilityId;
	private String sectCode;
	private String itemCode;
	private String fldCode;
	private String senVal;
	private String statusCode;
	private String statusMessage;
}
