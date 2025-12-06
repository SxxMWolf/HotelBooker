package com.hotel.booking.booking.repository;

import com.hotel.booking.booking.entity.Booking;
import com.hotel.booking.room.entity.Room;
import com.hotel.booking.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);
    
    /**
     * 특정 객실의 날짜 범위가 겹치는 예약을 조회
     * 날짜 범위 겹침 조건: (checkInDate < checkOutDate) AND (checkOutDate > checkInDate)
     * 예: 예약 A (12/10~12/12)와 예약 B (12/11~12/13)는 겹침
     */
    @Query("SELECT b FROM Booking b WHERE b.room = :room " +
           "AND b.checkInDate < :checkOutDate AND b.checkOutDate > :checkInDate")
    List<Booking> findByRoomAndCheckInDateAndCheckOutDate(
            @Param("room") Room room,
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate);
    
    List<Booking> findByStatusAndCreatedAtBefore(Booking.BookingStatus status, LocalDateTime createdAt);
    
    List<Booking> findByStatusAndCheckOutDateBefore(Booking.BookingStatus status, LocalDate checkOutDate);
    
    List<Booking> findByRoomAndStatus(Room room, Booking.BookingStatus status);
}

