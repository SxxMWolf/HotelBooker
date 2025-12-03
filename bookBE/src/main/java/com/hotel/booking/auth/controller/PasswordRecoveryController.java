package com.hotel.booking.auth.controller;

import com.hotel.booking.auth.dto.ForgotPasswordRequest;
import com.hotel.booking.auth.service.TemporaryPasswordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordRecoveryController {
    private final TemporaryPasswordService temporaryPasswordService;

    /**
     * 비밀번호 찾기: 임시 비밀번호 생성 및 이메일 발송
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        try {
            temporaryPasswordService.issueAndSend(request.getEmail());
            // 존재 유무를 노출하지 않기 위해 항상 동일 응답
            return ResponseEntity.ok(new java.util.HashMap<>());
        } catch (IllegalArgumentException e) {
            // 존재 유무를 노출하지 않기 위해 항상 동일 응답
            return ResponseEntity.ok(new java.util.HashMap<>());
        }
    }
}

