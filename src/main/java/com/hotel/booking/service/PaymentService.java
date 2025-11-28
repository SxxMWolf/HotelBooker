package com.hotel.booking.service;

import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Payment;
import com.hotel.booking.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    
    public Optional<Payment> getPaymentByBookingId(Long bookingId) {
        return paymentRepository.findByBooking_BookingId(bookingId);
    }
    
    @Transactional
    public Payment processPayment(Booking booking, Payment.PaymentMethod paymentMethod, 
                                 BigDecimal discountAmount) {
        BigDecimal finalAmount = booking.getTotalPrice().subtract(discountAmount);
        
        Payment payment = Payment.builder()
                .booking(booking)
                .amount(finalAmount)
                .paymentMethod(paymentMethod)
                .paymentStatus(Payment.PaymentStatus.COMPLETED)
                .discountAmount(discountAmount)
                .transactionId(UUID.randomUUID().toString())
                .build();
        
        Payment savedPayment = paymentRepository.save(payment);
        
        // 결제 완료 후 예약 상태 변경
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        
        return savedPayment;
    }
    
    @Transactional
    public Payment refundPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("결제 정보를 찾을 수 없습니다."));
        
        payment.setPaymentStatus(Payment.PaymentStatus.REFUNDED);
        payment.getBooking().setStatus(Booking.BookingStatus.CANCELLED);
        
        return paymentRepository.save(payment);
    }
}

