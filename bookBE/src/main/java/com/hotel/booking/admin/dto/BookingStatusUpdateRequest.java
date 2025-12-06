package com.hotel.booking.admin.dto;

import com.hotel.booking.booking.entity.Booking;
import lombok.Data;

@Data
public class BookingStatusUpdateRequest {
    private String status;
    
    public Booking.BookingStatus getStatus() {
        if (status == null) {
            return null;
        }
        try {
            return Booking.BookingStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("유효하지 않은 예약 상태입니다: " + status);
        }
    }
}

