package com.hotel.booking.review.repository;

import com.hotel.booking.review.entity.Review;
import com.hotel.booking.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRoomId(Long roomId);
    List<Review> findByUser(User user);
    boolean existsByBookingId(Long bookingId);
    List<Review> findByBookingId(Long bookingId);
}

