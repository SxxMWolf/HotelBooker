package com.hotel.booking.admin.controller;

import com.hotel.booking.admin.dto.*;
import com.hotel.booking.admin.service.AdminService;
import com.hotel.booking.booking.dto.BookingDTO;
import com.hotel.booking.notice.dto.NoticeDTO;
import com.hotel.booking.review.dto.ReviewDTO;
import com.hotel.booking.room.dto.RoomDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    // 대시보드
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> getDashboard(
            @RequestParam(required = false, defaultValue = "0") int year,
            @RequestParam(required = false, defaultValue = "0") int month) {
        if (year == 0 || month == 0) {
            java.time.LocalDate now = java.time.LocalDate.now();
            year = now.getYear();
            month = now.getMonthValue();
        }
        return ResponseEntity.ok(adminService.getDashboard(year, month));
    }

    @GetMapping("/bookings/today-checkins")
    public ResponseEntity<List<BookingDTO>> getTodayCheckIns() {
        return ResponseEntity.ok(adminService.getTodayCheckIns());
    }

    @GetMapping("/bookings/today-checkouts")
    public ResponseEntity<List<BookingDTO>> getTodayCheckOuts() {
        return ResponseEntity.ok(adminService.getTodayCheckOuts());
    }

    @GetMapping("/bookings/current-stays")
    public ResponseEntity<List<BookingDTO>> getCurrentStays() {
        return ResponseEntity.ok(adminService.getCurrentStays());
    }

    @GetMapping("/bookings/stats")
    public ResponseEntity<DashboardDTO.MonthlyStatsDTO> getMonthlyStats(
            @RequestParam(required = false, defaultValue = "0") int year,
            @RequestParam(required = false, defaultValue = "0") int month) {
        if (year == 0 || month == 0) {
            java.time.LocalDate now = java.time.LocalDate.now();
            year = now.getYear();
            month = now.getMonthValue();
        }
        return ResponseEntity.ok(adminService.getMonthlyStats(year, month));
    }

    @GetMapping("/rooms/status-summary")
    public ResponseEntity<DashboardDTO.RoomStatusSummaryDTO> getRoomStatusSummary() {
        return ResponseEntity.ok(adminService.getRoomStatusSummary());
    }

    @GetMapping("/statistics")
    public ResponseEntity<com.hotel.booking.admin.dto.StatisticsDTO> getStatistics(
            @RequestParam(required = false, defaultValue = "0") int startYear,
            @RequestParam(required = false, defaultValue = "0") int endYear) {
        if (startYear == 0 || endYear == 0) {
            java.time.LocalDate now = java.time.LocalDate.now();
            int currentYear = now.getYear();
            startYear = currentYear - 1; // 기본값: 작년부터 올해까지
            endYear = currentYear;
        }
        return ResponseEntity.ok(adminService.getStatistics(startYear, endYear));
    }

    // 객실 관리
    @GetMapping("/rooms")
    public ResponseEntity<List<RoomDTO>> getAllRooms() {
        return ResponseEntity.ok(adminService.getAllRooms());
    }

    @GetMapping("/rooms/{id}")
    public ResponseEntity<RoomDTO> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getRoomById(id));
    }

    @PostMapping("/rooms")
    public ResponseEntity<RoomDTO> createRoom(@RequestBody RoomDTO roomDTO) {
        return ResponseEntity.ok(adminService.createRoom(roomDTO));
    }

    @PutMapping("/rooms/{id}")
    public ResponseEntity<RoomDTO> updateRoom(@PathVariable Long id, @RequestBody RoomDTO roomDTO) {
        return ResponseEntity.ok(adminService.updateRoom(id, roomDTO));
    }

    @PutMapping("/rooms/{id}/disable")
    public ResponseEntity<Void> disableRoom(@PathVariable Long id) {
        adminService.disableRoom(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/rooms/{id}/enable")
    public ResponseEntity<Void> enableRoom(@PathVariable Long id) {
        adminService.enableRoom(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/rooms/{id}/status")
    public ResponseEntity<Void> updateRoomStatus(
            @PathVariable Long id,
            @RequestBody RoomStatusUpdateRequest request) {
        adminService.updateRoomStatus(id, request.getStatus());
        return ResponseEntity.ok().build();
    }

    // 예약 관리
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDTO>> getAllBookings() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<BookingDTO> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getBookingById(id));
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<Void> updateBookingStatus(
            @PathVariable Long id,
            @RequestBody BookingStatusUpdateRequest request) {
        adminService.updateBookingStatus(id, request.getStatus());
        return ResponseEntity.ok().build();
    }

    // 리뷰 관리
    @GetMapping("/reviews")
    public ResponseEntity<List<ReviewDTO>> getAllReviews() {
        return ResponseEntity.ok(adminService.getAllReviews());
    }

    @GetMapping("/reviews/{id}")
    public ResponseEntity<ReviewDTO> getReviewById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getReviewById(id));
    }

    @PutMapping("/reviews/{id}/toggle-visibility")
    public ResponseEntity<Void> toggleReviewVisibility(@PathVariable Long id) {
        adminService.toggleReviewVisibility(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reviews/{id}/reply")
    public ResponseEntity<Void> createReviewReply(
            @PathVariable Long id,
            @RequestBody ReviewReplyRequest request) {
        adminService.createReviewReply(id, request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/reviews/{id}/reply")
    public ResponseEntity<Void> updateReviewReply(
            @PathVariable Long id,
            @RequestBody ReviewReplyRequest request) {
        adminService.updateReviewReply(id, request.getContent());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/reviews/{id}/reply")
    public ResponseEntity<Void> deleteReviewReply(@PathVariable Long id) {
        adminService.deleteReviewReply(id);
        return ResponseEntity.ok().build();
    }

    // 공지사항 관리
    @GetMapping("/notices")
    public ResponseEntity<List<NoticeDTO>> getAllNotices() {
        return ResponseEntity.ok(adminService.getAllNotices());
    }

    @PostMapping("/notices")
    public ResponseEntity<NoticeDTO> createNotice(@RequestBody NoticeDTO noticeDTO) {
        return ResponseEntity.ok(adminService.createNotice(noticeDTO));
    }

    @PutMapping("/notices/{id}")
    public ResponseEntity<NoticeDTO> updateNotice(
            @PathVariable Long id,
            @RequestBody NoticeDTO noticeDTO) {
        return ResponseEntity.ok(adminService.updateNotice(id, noticeDTO));
    }

    @DeleteMapping("/notices/{id}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long id) {
        adminService.deleteNotice(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/notices/{id}/toggle-visibility")
    public ResponseEntity<Void> toggleNoticeVisibility(@PathVariable Long id) {
        adminService.toggleNoticeVisibility(id);
        return ResponseEntity.ok().build();
    }
}

