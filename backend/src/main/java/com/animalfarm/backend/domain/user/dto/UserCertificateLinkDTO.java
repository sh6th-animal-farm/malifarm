package com.animalfarm.backend.domain.user.dto;

import java.time.OffsetDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCertificateLinkDTO {

	private Long uclId;               // ucl_id (PK) = wallet_id
	private Long userId;
	private Long certificatesId;
	private String accountNo;
	private String accessToken;
	private String refreshToken;

	private OffsetDateTime tokenExpiredAt;
	private OffsetDateTime refreshTokenExpiredAt;

	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;

}