package com.hotel.booking.repository;

import com.hotel.booking.entity.Review;
import com.hotel.booking.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRoomAndVisibleTrueOrderByReviewDateDesc(Room room);
    List<Review> findByVisibleTrueOrderByReviewDateDesc();
    List<Review> findByVisibleFalseOrderByReviewDateDesc();
}

