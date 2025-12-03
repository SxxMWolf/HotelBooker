package com.hotel.booking.review.controller;

import com.hotel.booking.review.dto.ReviewDTO;
import com.hotel.booking.review.dto.ReviewRequest;
import com.hotel.booking.review.service.ReviewService;
import com.hotel.booking.common.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(
            @Valid @RequestBody ReviewRequest request,
            HttpServletRequest httpRequest) {
        String userId = getUserIdFromRequest(httpRequest);
        return ResponseEntity.ok(reviewService.createReview(userId, request));
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<ReviewDTO>> getRoomReviews(@PathVariable Long roomId) {
        return ResponseEntity.ok(reviewService.getRoomReviews(roomId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReviewDTO>> getUserReviews(HttpServletRequest httpRequest) {
        String userId = getUserIdFromRequest(httpRequest);
        return ResponseEntity.ok(reviewService.getUserReviews(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewDTO> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequest request,
            HttpServletRequest httpRequest) {
        String userId = getUserIdFromRequest(httpRequest);
        return ResponseEntity.ok(reviewService.updateReview(userId, id, request));
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

