package com.hotel.booking.room.entity;

import com.hotel.booking.booking.entity.Booking;
import com.hotel.booking.review.entity.Review;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private String type; // 싱글, 더블, 스위트 등

    @Column(nullable = false)
    private Integer capacity; // 수용 인원

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerNight;

    @Column(nullable = false)
    @Builder.Default
    private Boolean available = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RoomStatus status = RoomStatus.CLEAN;

    @Column(name = "status_updated_at")
    private java.time.LocalDateTime statusUpdatedAt;  // 상태 변경 시간 (자동 청소 완료용)

    @Column
    private String imageUrl;

    @Column
    private String viewType; // 오션뷰, 마운틴뷰

    @Column
    private Integer bedCount; // 침대 개수

    // CASCADE 제거: 객실 삭제 시 예약은 보존 (과거 예약 내역 보존 필요)
    @OneToMany(mappedBy = "room")
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();

    // CASCADE 제거: 객실 삭제 시 리뷰는 보존 (객실 리뷰 데이터 보존 필요)
    @OneToMany(mappedBy = "room")
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    public enum RoomStatus {
        CLEAN, DIRTY, MAINTENANCE
    }
}

