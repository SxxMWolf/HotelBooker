package com.hotel.booking.booking.dto;

import com.hotel.booking.payment.entity.Payment;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingRequest {
    @NotNull(message = "객실 ID는 필수입니다")
    private Long roomId;

    @NotNull(message = "체크인 날짜는 필수입니다")
    private LocalDate checkInDate;

    @NotNull(message = "체크아웃 날짜는 필수입니다")
    private LocalDate checkOutDate;

    @NotNull(message = "인원수는 필수입니다")
    @Min(value = 1, message = "인원수는 최소 1명 이상이어야 합니다")
    private Integer guests;

    @NotNull(message = "결제 방법은 필수입니다")
    private Payment.PaymentMethod method;
}

