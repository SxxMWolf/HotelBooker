package com.hotel.booking.booking.controller;

import com.hotel.booking.booking.dto.BookingDTO;
import com.hotel.booking.booking.dto.BookingRequest;
import com.hotel.booking.booking.service.BookingService;
import com.hotel.booking.common.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(
            @Valid @RequestBody BookingRequest request,
            HttpServletRequest httpRequest) {
        String userId = getUserIdFromRequest(httpRequest);
        return ResponseEntity.ok(bookingService.createBooking(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<BookingDTO>> getUserBookings(HttpServletRequest httpRequest) {
        String userId = getUserIdFromRequest(httpRequest);
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    @GetMapping("/reviewable")
    public ResponseEntity<List<BookingDTO>> getReviewableBookings(HttpServletRequest httpRequest) {
        String userId = getUserIdFromRequest(httpRequest);
        return ResponseEntity.ok(bookingService.getReviewableBookings(userId));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<BookingDTO> getBookingById(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        String userId = getUserIdFromRequest(httpRequest);
        return ResponseEntity.ok(bookingService.getBookingById(id, userId));
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> cancelBooking(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        String userId = getUserIdFromRequest(httpRequest);
        bookingService.cancelBooking(id, userId);
        return ResponseEntity.ok().build();
    }


    private String getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.getIdFromToken(token);
        }
        throw new RuntimeException("인증 토큰이 없습니다");
    }
}

