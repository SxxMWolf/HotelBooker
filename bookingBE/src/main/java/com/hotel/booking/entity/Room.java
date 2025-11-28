package com.hotel.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long roomId;
    
    @Column(name = "room_number", unique = true, nullable = false, length = 20)
    private String roomNumber;
    
    @Column(name = "room_name", nullable = false, length = 100)
    private String roomName;
    
    @Column(name = "room_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private RoomType roomType;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "max_guests", nullable = false)
    @Builder.Default
    private Integer maxGuests = 2;
    
    @Column(name = "price_per_night", nullable = false, precision = 10, scale = 2)
    private java.math.BigDecimal pricePerNight;
    
    @Column(name = "image_url", length = 500)
    private String imageUrl;
    
    @Column(columnDefinition = "TEXT")
    private String amenities;
    
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RoomStatus status = RoomStatus.AVAILABLE;
    
    @Column(name = "cleaning_needed", nullable = false)
    @Builder.Default
    private Boolean cleaningNeeded = false;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum RoomType {
        STANDARD, DELUXE, SUITE
    }
    
    public enum RoomStatus {
        AVAILABLE, BOOKED, MAINTENANCE, CLEANING
    }
}

