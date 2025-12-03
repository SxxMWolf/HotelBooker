package com.hotel.booking.notice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeDTO {
    private Long id;
    private String title;
    private String content;
    private Boolean important;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

