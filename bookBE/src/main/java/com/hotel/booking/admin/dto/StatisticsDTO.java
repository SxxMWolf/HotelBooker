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
public class StatisticsDTO {
    private List<MonthlyStatisticsDTO> monthlyStatistics;
    private List<YearlyStatisticsDTO> yearlyStatistics;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyStatisticsDTO {
        private Integer year;
        private Integer month;
        private Integer totalBookings;
        private BigDecimal totalRevenue;
        private BigDecimal averageBookingAmount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class YearlyStatisticsDTO {
        private Integer year;
        private Integer totalBookings;
        private BigDecimal totalRevenue;
        private BigDecimal averageBookingAmount;
        private BigDecimal averageMonthlyRevenue;
    }
}

