package com.hotel.booking.service;

import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.User;
import com.hotel.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final RoomService roomService;
    
    public List<Booking> getUserBookings(User user) {
        return bookingRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    public Optional<Booking> getBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId);
    }
    
    public List<Booking> getCheckInsForToday() {
        LocalDate today = LocalDate.now();
        return bookingRepository.findCheckInsByDate(today, 
                List.of(Booking.BookingStatus.CONFIRMED, Booking.BookingStatus.CHECKED_IN));
    }
    
    public List<Booking> getCheckOutsForToday() {
        LocalDate today = LocalDate.now();
        return bookingRepository.findCheckOutsByDate(today, 
                List.of(Booking.BookingStatus.CHECKED_IN, Booking.BookingStatus.CONFIRMED));
    }
    
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
    
    @Transactional
    public Booking createBooking(User user, Long roomId, LocalDate checkInDate, 
                                LocalDate checkOutDate, Integer numGuests, String specialRequests) {
        Room room = roomService.getRoomById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("객실을 찾을 수 없습니다."));
        
        if (!room.getActive()) {
            throw new IllegalArgumentException("예약 가능하지 않은 객실입니다.");
        }
        
        long nights = ChronoUnit.DAYS.between(checkInDate, checkOutDate);
        BigDecimal totalPrice = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));
        
        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .checkInDate(checkInDate)
                .checkOutDate(checkOutDate)
                .numGuests(numGuests)
                .totalPrice(totalPrice)
                .status(Booking.BookingStatus.PENDING)
                .specialRequests(specialRequests)
                .cancellationPolicy("체크인 1일 전까지 무료 취소")
                .build();
        
        return bookingRepository.save(booking);
    }
    
    @Transactional
    public Booking cancelBooking(Long bookingId, User user) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다."));
        
        if (!booking.getUser().getUserId().equals(user.getUserId()) && 
            !user.getRole().equals(User.Role.ADMIN)) {
            throw new IllegalArgumentException("예약을 취소할 권한이 없습니다.");
        }
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
    
    @Transactional
    public Booking updateBookingStatus(Long bookingId, Booking.BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다."));
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }
}

