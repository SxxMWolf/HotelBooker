package com.hotel.booking.payment.dto;

import com.hotel.booking.payment.entity.Payment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDTO {
    private Long id;
    private Long bookingId;
    private BigDecimal amount;
    private Payment.PaymentMethod method;
    private Payment.PaymentStatus status;
    private LocalDateTime paymentDate;
    private String transactionId;
}

