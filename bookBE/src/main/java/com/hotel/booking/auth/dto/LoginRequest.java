package com.hotel.booking.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "아이디는 필수입니다")
    private String id;

    @NotBlank(message = "비밀번호는 필수입니다")
    private String password;
}

