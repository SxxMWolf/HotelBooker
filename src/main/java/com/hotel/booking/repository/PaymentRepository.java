package com.hotel.booking.repository;

import com.hotel.booking.entity.Payment;
import com.hotel.booking.entity.Payment.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBooking_BookingId(Long bookingId);
    List<Payment> findByPaymentStatus(PaymentStatus status);
}

