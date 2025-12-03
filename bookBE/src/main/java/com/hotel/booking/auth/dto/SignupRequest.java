package com.hotel.booking.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank(message = "아이디는 필수입니다")
    @Size(min = 3, max = 15, message = "아이디는 3-15자 사이여야 합니다")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "아이디는 알파벳과 숫자만 사용할 수 있습니다")
    private String id;

    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다")
    private String password;

    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "유효한 이메일 형식이 아닙니다")
    private String email;

    @NotBlank(message = "닉네임은 필수입니다")
    private String nickname;
}

