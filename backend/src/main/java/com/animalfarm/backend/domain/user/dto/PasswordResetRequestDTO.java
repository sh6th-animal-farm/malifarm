package com.animalfarm.backend.domain.user.dto;

import lombok.Data;

@Data
public class PasswordResetRequestDTO {
    private String email;
    private String verificationCode;
    private String newPassword;
    private String confirmPassword;
}
