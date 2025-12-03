package com.hotel.booking.notice.controller;

import com.hotel.booking.notice.dto.NoticeDTO;
import com.hotel.booking.notice.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {
    private final NoticeService noticeService;

    @GetMapping
    public ResponseEntity<List<NoticeDTO>> getAllNotices() {
        return ResponseEntity.ok(noticeService.getAllNotices());
    }
}

