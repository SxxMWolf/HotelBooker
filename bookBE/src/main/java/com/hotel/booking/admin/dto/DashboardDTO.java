package com.hotel.booking.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {
    private List<BookingSummaryDTO> todayCheckIns;
    private List<BookingSummaryDTO> todayCheckOuts;
    private MonthlyStatsDTO monthlyStats;
    private RoomStatusSummaryDTO roomStatusSummary;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BookingSummaryDTO {
        private Long id;
        private String roomName;
        private String userName;
        private String checkInDate;
        private String checkOutDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyStatsDTO {
        private Integer totalBookings;
        private BigDecimal totalRevenue;
        private BigDecimal averageBookingAmount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RoomStatusSummaryDTO {
        private Long booked;
        private Long available;
        private Long cleaningNeeded;
        private Long maintenance;
        private Long inUse; // 현재 사용 중인 객실
    }
}

