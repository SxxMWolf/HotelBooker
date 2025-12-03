package com.hotel.booking.booking.service;

import com.hotel.booking.booking.dto.BookingDTO;
import com.hotel.booking.booking.dto.BookingRequest;
import com.hotel.booking.payment.dto.PaymentDTO;
import com.hotel.booking.booking.entity.Booking;
import com.hotel.booking.payment.entity.Payment;
import com.hotel.booking.room.entity.Room;
import com.hotel.booking.user.entity.User;
import com.hotel.booking.booking.repository.BookingRepository;
import com.hotel.booking.payment.repository.PaymentRepository;
import com.hotel.booking.room.repository.RoomRepository;
import com.hotel.booking.user.repository.UserRepository;
import com.hotel.booking.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    @Transactional
    public BookingDTO createBooking(String userId, BookingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("객실을 찾을 수 없습니다"));

        if (!room.getAvailable()) {
            throw new RuntimeException("예약 가능한 객실이 아닙니다");
        }

        // 날짜 검증
        if (request.getCheckInDate().isAfter(request.getCheckOutDate()) || 
            request.getCheckInDate().isEqual(request.getCheckOutDate())) {
            throw new RuntimeException("체크아웃 날짜는 체크인 날짜보다 이후여야 합니다");
        }

        // 중복 예약 확인
        List<Room> availableRooms = roomRepository.findAvailableRooms(
                request.getCheckInDate(), request.getCheckOutDate());
        if (!availableRooms.contains(room)) {
            throw new RuntimeException("선택한 날짜에 예약 가능한 객실이 아닙니다");
        }

        // 총 가격 계산
        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal totalPrice = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        // 예약 생성 (CONFIRMED 상태로 생성 - 결제 완료 후)
        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .guests(request.getGuests())
                .totalPrice(totalPrice)
                .status(Booking.BookingStatus.CONFIRMED)
                .build();

        // Booking을 먼저 저장하여 ID를 생성
        booking = bookingRepository.save(booking);

        // 결제 생성 및 처리 (booking이 저장된 후 생성)
        Payment payment = Payment.builder()
                .booking(booking)
                .amount(totalPrice)
                .method(request.getMethod())
                .status(Payment.PaymentStatus.COMPLETED)
                .paymentDate(java.time.LocalDateTime.now())
                .transactionId(java.util.UUID.randomUUID().toString())
                .build();

        // Payment 저장
        payment = paymentRepository.save(payment);
        
        // Booking에 Payment 연결 (양방향 관계 설정)
        booking.setPayment(payment);
        booking = bookingRepository.save(booking);

        return convertToDTO(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getUserBookings(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        return bookingRepository.findByUser(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getReviewableBookings(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        LocalDate today = LocalDate.now();
        LocalDate oneMonthAgo = today.minusMonths(1);
        
        return bookingRepository.findByUser(user).stream()
                .filter(booking -> booking.getStatus() == Booking.BookingStatus.COMPLETED)
                .filter(booking -> {
                    LocalDate checkOutDate = booking.getCheckOutDate();
                    // 체크아웃 날짜가 오늘 이전이고, 1달 이내인 경우
                    return !checkOutDate.isAfter(today) && !checkOutDate.isBefore(oneMonthAgo);
                })
                .filter(booking -> !reviewRepository.existsByBookingId(booking.getId()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingDTO getBookingById(Long id, String userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다"));
        
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("예약 정보에 접근할 권한이 없습니다");
        }
        
        return convertToDTO(booking);
    }

    @Transactional
    public void cancelBooking(Long id, String userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다"));
        
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("예약을 취소할 권한이 없습니다");
        }
        
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("이미 취소된 예약입니다");
        }
        
        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED && 
            booking.getStatus() != Booking.BookingStatus.COMPLETED) {
            throw new RuntimeException("확정되거나 완료된 예약만 취소할 수 있습니다");
        }
        
        // 예약 취소 시 해당 예약과 연결된 리뷰 삭제
        List<com.hotel.booking.review.entity.Review> reviews = reviewRepository.findByBookingId(booking.getId());
        if (!reviews.isEmpty()) {
            reviewRepository.deleteAll(reviews);
        }
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    @Transactional
    public void deleteBooking(Long id, String userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다"));
        
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("예약을 삭제할 권한이 없습니다");
        }
        
        if (booking.getStatus() != Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("취소된 예약만 삭제할 수 있습니다");
        }
        
        // 예약 삭제 시 해당 예약과 연결된 리뷰 삭제
        List<com.hotel.booking.review.entity.Review> reviews = reviewRepository.findByBookingId(booking.getId());
        if (!reviews.isEmpty()) {
            reviewRepository.deleteAll(reviews);
        }
        
        // 예약 삭제
        bookingRepository.delete(booking);
    }

    private BookingDTO convertToDTO(Booking booking) {
        // 결제 정보 조회
        Optional<Payment> paymentOpt = paymentRepository.findByBookingId(booking.getId());
        PaymentDTO paymentDTO = null;
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            paymentDTO = PaymentDTO.builder()
                    .id(payment.getId())
                    .bookingId(payment.getBooking().getId())
                    .amount(payment.getAmount())
                    .method(payment.getMethod())
                    .status(payment.getStatus())
                    .paymentDate(payment.getPaymentDate())
                    .transactionId(payment.getTransactionId())
                    .build();
        }

        return BookingDTO.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .roomId(booking.getRoom().getId())
                .roomName(booking.getRoom().getName())
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .guests(booking.getGuests())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .payment(paymentDTO)
                .build();
    }
}

