package com.hotel.booking.booking.controller;

import com.hotel.booking.payment.dto.PaymentDTO;
import com.hotel.booking.payment.dto.PaymentRequest;
import com.hotel.booking.payment.service.PaymentService;
import com.hotel.booking.common.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<PaymentDTO> processPayment(
            @Valid @RequestBody PaymentRequest request,
            HttpServletRequest httpRequest) {
        String userId = getUserIdFromRequest(httpRequest);
        return ResponseEntity.ok(paymentService.processPayment(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<PaymentDTO>> getUserPayments(HttpServletRequest httpRequest) {
        String userId = getUserIdFromRequest(httpRequest);
        return ResponseEntity.ok(paymentService.getUserPayments(userId));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentDTO> getPaymentByBookingId(
            @PathVariable Long bookingId,
            HttpServletRequest httpRequest) {
        String userId = getUserIdFromRequest(httpRequest);
        return ResponseEntity.ok(paymentService.getPaymentByBookingId(bookingId, userId));
    }

    private String getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.getIdFromToken(token);
        }
        throw new RuntimeException("인증 토큰이 없습니다");
    }
}

