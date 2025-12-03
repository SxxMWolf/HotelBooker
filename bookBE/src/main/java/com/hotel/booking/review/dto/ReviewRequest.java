package com.hotel.booking.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequest {
    private Long bookingId; // 리뷰 작성 시에만 필수, 수정 시에는 사용하지 않음

    @NotNull(message = "평점은 필수입니다")
    @Min(value = 1, message = "평점은 1 이상이어야 합니다")
    @Max(value = 5, message = "평점은 5 이하여야 합니다")
    private Integer rating;

    private String title; // 리뷰 제목

    private String comment; // 리뷰 내용
}

