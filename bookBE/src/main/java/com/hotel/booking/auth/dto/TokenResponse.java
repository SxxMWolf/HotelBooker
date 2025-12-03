package com.hotel.booking.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenResponse {
    private String token;
    private String type;
    private Long expirationMs;
    private String role;
}

