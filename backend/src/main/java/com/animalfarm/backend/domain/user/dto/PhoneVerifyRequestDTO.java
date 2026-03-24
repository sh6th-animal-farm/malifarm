package com.animalfarm.backend.domain.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PhoneVerifyRequestDTO {
	private String phone;
	private String code;
}
