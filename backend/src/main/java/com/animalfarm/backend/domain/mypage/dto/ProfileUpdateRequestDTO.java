package com.animalfarm.backend.domain.mypage.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileUpdateRequestDTO {
	private String address;
	private Boolean pushYn;
	private Boolean receiveEmailYn;
}
