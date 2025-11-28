package com.hotel.booking.repository;

import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Booking.BookingStatus;
import com.hotel.booking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);
    List<Booking> findByUserOrderByCreatedAtDesc(User user);
    
    @Query("SELECT b FROM Booking b WHERE b.checkInDate = :date AND b.status IN :statuses")
    List<Booking> findCheckInsByDate(@Param("date") LocalDate date, 
                                     @Param("statuses") List<BookingStatus> statuses);
    
    @Query("SELECT b FROM Booking b WHERE b.checkOutDate = :date AND b.status IN :statuses")
    List<Booking> findCheckOutsByDate(@Param("date") LocalDate date, 
                                      @Param("statuses") List<BookingStatus> statuses);
    
    @Query("SELECT b FROM Booking b WHERE b.checkInDate <= :date AND b.checkOutDate >= :date AND b.status != 'CANCELLED'")
    List<Booking> findActiveBookingsOnDate(@Param("date") LocalDate date);
    
    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);
}

