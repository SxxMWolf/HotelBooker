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

        // 객실 활성화 여부 체크 (available = false면 예약 불가)
        if (!room.getAvailable()) {
            throw new RuntimeException("비활성화된 객실입니다. 예약할 수 없습니다");
        }

        // 날짜 검증
        if (request.getCheckInDate().isAfter(request.getCheckOutDate()) || 
            request.getCheckInDate().isEqual(request.getCheckOutDate())) {
            throw new RuntimeException("체크아웃 날짜는 체크인 날짜보다 이후여야 합니다");
        }

        // 중복 예약 확인 (같은 객실의 같은 날짜 범위에 예약이 있는지 체크)
        // 취소되지 않은 예약 중에서 날짜 범위가 겹치는 예약이 있는지 확인
        List<Booking> overlappingBookings = bookingRepository.findByRoomAndCheckInDateAndCheckOutDate(
                room, request.getCheckInDate(), request.getCheckOutDate());
        
        // 취소되지 않은 예약이 있는지 확인
        boolean hasOverlap = overlappingBookings.stream()
                .anyMatch(b -> b.getStatus() != Booking.BookingStatus.CANCELLED);
        
        if (hasOverlap) {
            throw new RuntimeException("선택한 날짜에 이미 예약이 있습니다. 다른 날짜를 선택해주세요.");
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
                .amount(totalPrice)
                .method(request.getMethod())
                .status(Payment.PaymentStatus.PAID)
                .paymentDate(java.time.LocalDateTime.now())
                .transactionId(java.util.UUID.randomUUID().toString())
                .build();
        
        // Payment에 Booking 명시적으로 설정 (JPA 관계 설정)
        payment.setBooking(booking);

        // Payment 저장
        payment = paymentRepository.save(payment);
        
        // Booking에 Payment 연결 (양방향 관계 설정)
        booking.setPayment(payment);
        bookingRepository.save(booking);

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
                .filter(booking -> {
                    // 취소된 예약은 리뷰 작성 불가
                    if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
                        return false;
                    }
                    // 리뷰 가능 여부 판단: 날짜 기반 (체크아웃 후) + 상태 확인 (취소 아님)
                    LocalDate checkOutDate = booking.getCheckOutDate();
                    return checkOutDate.isBefore(today) && !checkOutDate.isBefore(oneMonthAgo);
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
        
        // 체크인 일주일 전까지만 취소 가능 (CONFIRMED 상태만)
        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new RuntimeException("체크인 전 예약만 취소할 수 있습니다");
        }
        
        // 체크인 날짜로부터 7일 이상 남아있어야 취소 가능
        LocalDate today = LocalDate.now();
        LocalDate checkInDate = booking.getCheckInDate();
        long daysUntilCheckIn = java.time.temporal.ChronoUnit.DAYS.between(today, checkInDate);
        
        if (daysUntilCheckIn < 7) {
            throw new RuntimeException("체크인 일주일 전까지만 취소할 수 있습니다");
        }
        
        // 예약 취소 시 해당 예약과 연결된 리뷰 삭제
        List<com.hotel.booking.review.entity.Review> reviews = reviewRepository.findByBookingId(booking.getId());
        if (!reviews.isEmpty()) {
            reviewRepository.deleteAll(reviews);
        }
        
        // 예약 취소 시 결제 상태를 환불(REFUNDED)로 변경
        if (booking.getPayment() != null) {
            Payment payment = booking.getPayment();
            payment.setStatus(Payment.PaymentStatus.REFUNDED);
            paymentRepository.save(payment);
        }
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);
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
                .userName(booking.getUser().getNickname())
                .roomId(booking.getRoom().getId())
                .roomName(booking.getRoom().getName())
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .guests(booking.getGuests())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .specialRequests(booking.getSpecialRequests())
                .createdAt(booking.getCreatedAt())
                .payment(paymentDTO)
                .build();
    }
}

