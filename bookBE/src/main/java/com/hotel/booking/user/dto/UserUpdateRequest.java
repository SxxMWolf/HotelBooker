package com.hotel.booking.user.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String email;
    private String nickname;
    private String password;
}

