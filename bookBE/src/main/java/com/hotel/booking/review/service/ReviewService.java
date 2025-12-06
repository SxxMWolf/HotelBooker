package com.hotel.booking.review.service;

import com.hotel.booking.review.dto.ReviewDTO;
import com.hotel.booking.review.dto.ReviewRequest;
import com.hotel.booking.booking.entity.Booking;
import com.hotel.booking.review.entity.Review;
import com.hotel.booking.user.entity.User;
import com.hotel.booking.booking.repository.BookingRepository;
import com.hotel.booking.review.repository.ReviewRepository;
import com.hotel.booking.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewDTO createReview(String userId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("리뷰를 작성할 권한이 없습니다");
        }

        if (reviewRepository.existsByBookingId(booking.getId())) {
            throw new RuntimeException("이미 리뷰를 작성한 예약입니다");
        }

        // 취소된 예약은 리뷰 작성 불가
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("취소된 예약은 리뷰를 작성할 수 없습니다");
        }

        // 리뷰 가능 여부 판단: 날짜 기반 (체크아웃 후) + 상태 확인 (취소 아님)
        LocalDate today = LocalDate.now();
        LocalDate oneMonthAgo = today.minusMonths(1);
        LocalDate checkOutDate = booking.getCheckOutDate();
        
        if (!checkOutDate.isBefore(today)) {
            throw new RuntimeException("체크아웃 후에만 리뷰를 작성할 수 있습니다");
        }
        
        if (checkOutDate.isBefore(oneMonthAgo)) {
            throw new RuntimeException("체크아웃 후 1달 이내에만 리뷰를 작성할 수 있습니다");
        }

        Review review = Review.builder()
                .user(user)
                .room(booking.getRoom())
                .booking(booking)
                .rating(request.getRating())
                .title(request.getTitle())
                .comment(request.getComment())
                .build();

        review = reviewRepository.save(review);
        return convertToDTO(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewDTO> getRoomReviews(Long roomId) {
        return reviewRepository.findByRoomId(roomId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewDTO> getUserReviews(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        return reviewRepository.findByUser(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDTO updateReview(String userId, Long reviewId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다"));

        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("리뷰를 수정할 권한이 없습니다");
        }

        // 리뷰 수정 (bookingId는 무시)
        review.setRating(request.getRating());
        if (request.getTitle() != null) {
            review.setTitle(request.getTitle());
        }
        if (request.getComment() != null) {
            review.setComment(request.getComment());
        }

        review = reviewRepository.save(review);
        return convertToDTO(review);
    }

    private ReviewDTO convertToDTO(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getNickname())
                .roomId(review.getRoom().getId())
                .rating(review.getRating())
                .title(review.getTitle())
                .comment(review.getComment())
                .isPublic(review.getIsPublic())
                .adminReply(review.getAdminReply())
                .adminReplyDate(review.getAdminReplyDate())
                .createdAt(review.getCreatedAt())
                .build();
    }
}

