package com.hotel.booking.room.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomDTO {
    private Long id;
    private String name;
    private String description;
    private String type;
    private Integer capacity;
    private BigDecimal pricePerNight;
    private Boolean available;
    private String imageUrl;
    private Double averageRating;
    private Integer reviewCount;
    private Boolean allBooked; // 해당 타입의 모든 방이 예약 완료되었는지 여부
    private String viewType; // 오션뷰, 마운틴뷰
    private Integer bedCount; // 침대 개수
}

