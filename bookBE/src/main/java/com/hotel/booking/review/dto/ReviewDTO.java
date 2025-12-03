package com.hotel.booking.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {
    private Long id;
    private String userId;
    private String userName;
    private Long roomId;
    private Integer rating;
    private String title;
    private String comment;
    private LocalDateTime createdAt;
}

