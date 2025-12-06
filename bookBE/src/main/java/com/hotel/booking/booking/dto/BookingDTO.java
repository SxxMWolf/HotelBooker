package com.hotel.booking.booking.dto;

import com.hotel.booking.booking.entity.Booking;
import com.hotel.booking.payment.dto.PaymentDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDTO {
    private Long id;
    private String userId;
    private String userName;
    private Long roomId;
    private String roomName;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer guests;
    private BigDecimal totalPrice;
    private Booking.BookingStatus status;
    private String specialRequests;
    private LocalDateTime createdAt;
    private PaymentDTO payment;
}

