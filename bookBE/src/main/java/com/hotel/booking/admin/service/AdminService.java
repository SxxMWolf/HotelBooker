package com.hotel.booking.admin.service;

import com.hotel.booking.admin.dto.*;
import com.hotel.booking.booking.dto.BookingDTO;
import com.hotel.booking.booking.entity.Booking;
import com.hotel.booking.booking.repository.BookingRepository;
import com.hotel.booking.payment.entity.Payment;
import com.hotel.booking.payment.repository.PaymentRepository;
import com.hotel.booking.review.dto.ReviewDTO;
import com.hotel.booking.review.entity.Review;
import com.hotel.booking.review.repository.ReviewRepository;
import com.hotel.booking.room.dto.RoomDTO;
import com.hotel.booking.room.entity.Room;
import com.hotel.booking.room.repository.RoomRepository;
import com.hotel.booking.notice.dto.NoticeDTO;
import com.hotel.booking.notice.entity.Notice;
import com.hotel.booking.notice.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final RoomRepository roomRepository;
    private final ReviewRepository reviewRepository;
    private final NoticeRepository noticeRepository;

    // 대시보드
    public DashboardDTO getDashboard(int year, int month) {
        LocalDate today = LocalDate.now();
        
        // 오늘 체크인: CONFIRMED + 오늘 체크인 (예약 기준만 사용, 객실 상태와 무관)
        List<Booking> todayCheckIns = bookingRepository.findAll().stream()
                .filter(b -> b.getCheckInDate().equals(today) && 
                        b.getStatus() == Booking.BookingStatus.CONFIRMED)
                .collect(Collectors.toList());
        
        // 오늘 체크아웃: CHECKED_IN + 오늘 체크아웃 (예약 기준만 사용, 객실 상태와 무관)
        List<Booking> todayCheckOuts = bookingRepository.findAll().stream()
                .filter(b -> b.getCheckOutDate().equals(today) && 
                        b.getStatus() == Booking.BookingStatus.CHECKED_IN)
                .collect(Collectors.toList());

        // 월별 통계: 예약 생성일(createdAt) 기준으로 계산
        List<Booking> monthlyBookings = bookingRepository.findAll().stream()
                .filter(b -> {
                    if (b.getCreatedAt() == null) return false;
                    LocalDateTime createdAt = b.getCreatedAt();
                    return createdAt.getYear() == year && createdAt.getMonthValue() == month;
                })
                .collect(Collectors.toList());

        BigDecimal totalRevenue = monthlyBookings.stream()
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageBookingAmount = monthlyBookings.isEmpty() ? BigDecimal.ZERO :
                totalRevenue.divide(BigDecimal.valueOf(monthlyBookings.size()), 2, java.math.RoundingMode.HALF_UP);

        long bookedCount = calculateBookedCount(today);
        
        List<Room> allRooms = roomRepository.findAll();
        
        // 사용 가능 객실: status = CLEAN (객실 기준만 사용, 예약과 무관)
        long availableCount = allRooms.stream()
                .filter(r -> r.getStatus() == Room.RoomStatus.CLEAN)
                .count();
        
        // 청소 필요: status = DIRTY (객실 기준만 사용)
        long cleaningNeededCount = allRooms.stream()
                .filter(r -> r.getStatus() == Room.RoomStatus.DIRTY)
                .count();
        
        // 보수 중: status = MAINTENANCE (객실 기준만 사용)
        long maintenanceCount = allRooms.stream()
                .filter(r -> r.getStatus() == Room.RoomStatus.MAINTENANCE)
                .count();
        
        // 현재 사용 중인 객실: CHECKED_IN 상태의 예약이 있고 체크아웃 날짜가 아직 지나지 않은 객실
        // (이 항목은 예약 기준이므로 유지)
        long inUseCount = allRooms.stream()
                .filter(r -> r.getBookings().stream()
                        .anyMatch(b -> b.getStatus() == Booking.BookingStatus.CHECKED_IN &&
                                !b.getCheckOutDate().isBefore(today)))
                .count();

        return DashboardDTO.builder()
                .todayCheckIns(convertToBookingSummary(todayCheckIns))
                .todayCheckOuts(convertToBookingSummary(todayCheckOuts))
                .monthlyStats(DashboardDTO.MonthlyStatsDTO.builder()
                        .totalBookings(monthlyBookings.size())
                        .totalRevenue(totalRevenue)
                        .averageBookingAmount(averageBookingAmount)
                        .build())
                .roomStatusSummary(DashboardDTO.RoomStatusSummaryDTO.builder()
                        .booked(bookedCount)
                        .available(availableCount)
                        .cleaningNeeded(cleaningNeededCount)
                        .maintenance(maintenanceCount)
                        .inUse(inUseCount)
                        .build())
                .build();
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getTodayCheckIns() {
        // 오늘 체크인: CONFIRMED + 오늘 체크인 (예약 기준만 사용, 객실 상태와 무관)
        LocalDate today = LocalDate.now();
        return bookingRepository.findAll().stream()
                .filter(b -> b.getCheckInDate().equals(today) && 
                        b.getStatus() == Booking.BookingStatus.CONFIRMED)
                .map(this::convertToBookingDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getTodayCheckOuts() {
        // 오늘 체크아웃: CHECKED_IN + 오늘 체크아웃 (예약 기준만 사용, 객실 상태와 무관)
        LocalDate today = LocalDate.now();
        return bookingRepository.findAll().stream()
                .filter(b -> b.getCheckOutDate().equals(today) && 
                        b.getStatus() == Booking.BookingStatus.CHECKED_IN)
                .map(this::convertToBookingDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getCurrentStays() {
        try {
            // 현재 투숙 중: CHECKED_IN (예약 기준만 사용, 객실 상태와 무관)
            return bookingRepository.findAll().stream()
                    .filter(b -> b.getStatus() == Booking.BookingStatus.CHECKED_IN)
                    .map(this::convertToBookingDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("현재 투숙 중 예약 조회 실패: " + e.getMessage(), e);
        }
    }

    public DashboardDTO.MonthlyStatsDTO getMonthlyStats(int year, int month) {
        // 월별 통계: 예약 생성일(createdAt) 기준으로 계산
        List<Booking> monthlyBookings = bookingRepository.findAll().stream()
                .filter(b -> {
                    if (b.getCreatedAt() == null) return false;
                    LocalDateTime createdAt = b.getCreatedAt();
                    return createdAt.getYear() == year && createdAt.getMonthValue() == month;
                })
                .collect(Collectors.toList());

        BigDecimal totalRevenue = monthlyBookings.stream()
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageBookingAmount = monthlyBookings.isEmpty() ? BigDecimal.ZERO :
                totalRevenue.divide(BigDecimal.valueOf(monthlyBookings.size()), 2, java.math.RoundingMode.HALF_UP);

        return DashboardDTO.MonthlyStatsDTO.builder()
                .totalBookings(monthlyBookings.size())
                .totalRevenue(totalRevenue)
                .averageBookingAmount(averageBookingAmount)
                .build();
    }

    @Transactional(readOnly = true)
    public com.hotel.booking.admin.dto.StatisticsDTO getStatistics(int startYear, int endYear) {
        List<Booking> allBookings = bookingRepository.findAll();
        
        // 월별 통계
        List<com.hotel.booking.admin.dto.StatisticsDTO.MonthlyStatisticsDTO> monthlyStats = new java.util.ArrayList<>();
        for (int year = startYear; year <= endYear; year++) {
            final int finalYear = year;
            for (int month = 1; month <= 12; month++) {
                final int finalMonth = month;
                // 월별 통계: 예약 생성일(createdAt) 기준으로 계산
                List<Booking> monthlyBookings = allBookings.stream()
                        .filter(b -> {
                            if (b.getCreatedAt() == null) return false;
                            LocalDateTime createdAt = b.getCreatedAt();
                            return createdAt.getYear() == finalYear && createdAt.getMonthValue() == finalMonth;
                        })
                        .collect(Collectors.toList());
                
                if (!monthlyBookings.isEmpty()) {
                    BigDecimal totalRevenue = monthlyBookings.stream()
                            .map(Booking::getTotalPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    BigDecimal averageBookingAmount = totalRevenue.divide(
                            BigDecimal.valueOf(monthlyBookings.size()), 2, java.math.RoundingMode.HALF_UP);
                    
                    monthlyStats.add(com.hotel.booking.admin.dto.StatisticsDTO.MonthlyStatisticsDTO.builder()
                            .year(finalYear)
                            .month(finalMonth)
                            .totalBookings(monthlyBookings.size())
                            .totalRevenue(totalRevenue)
                            .averageBookingAmount(averageBookingAmount)
                            .build());
                }
            }
        }
        
        // 년도별 통계
        List<com.hotel.booking.admin.dto.StatisticsDTO.YearlyStatisticsDTO> yearlyStats = new java.util.ArrayList<>();
        for (int year = startYear; year <= endYear; year++) {
            final int finalYear = year;
            List<Booking> yearlyBookings = allBookings.stream()
                    .filter(b -> b.getCheckInDate().getYear() == finalYear)
                    .collect(Collectors.toList());
            
            if (!yearlyBookings.isEmpty()) {
                BigDecimal totalRevenue = yearlyBookings.stream()
                        .map(Booking::getTotalPrice)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                BigDecimal averageBookingAmount = totalRevenue.divide(
                        BigDecimal.valueOf(yearlyBookings.size()), 2, java.math.RoundingMode.HALF_UP);
                
                // 월별 평균 매출 계산
                final int currentYear = finalYear;
                long monthsWithBookings = monthlyStats.stream()
                        .filter(ms -> ms.getYear() == currentYear)
                        .count();
                BigDecimal averageMonthlyRevenue = monthsWithBookings > 0 ?
                        totalRevenue.divide(BigDecimal.valueOf(monthsWithBookings), 2, java.math.RoundingMode.HALF_UP) :
                        BigDecimal.ZERO;
                
                yearlyStats.add(com.hotel.booking.admin.dto.StatisticsDTO.YearlyStatisticsDTO.builder()
                        .year(finalYear)
                        .totalBookings(yearlyBookings.size())
                        .totalRevenue(totalRevenue)
                        .averageBookingAmount(averageBookingAmount)
                        .averageMonthlyRevenue(averageMonthlyRevenue)
                        .build());
            }
        }
        
        return com.hotel.booking.admin.dto.StatisticsDTO.builder()
                .monthlyStatistics(monthlyStats)
                .yearlyStatistics(yearlyStats)
                .build();
    }

    public DashboardDTO.RoomStatusSummaryDTO getRoomStatusSummary() {
        try {
            LocalDate today = LocalDate.now();
            long bookedCount = calculateBookedCount(today);
            
            List<Room> allRooms = roomRepository.findAll();
            
            // 사용 가능 객실: status = CLEAN (객실 기준만 사용, 예약과 무관)
            long availableCount = allRooms.stream()
                    .filter(r -> r.getStatus() == Room.RoomStatus.CLEAN)
                    .count();
            
            // 청소 필요: status = DIRTY (객실 기준만 사용)
            long cleaningNeededCount = allRooms.stream()
                    .filter(r -> r.getStatus() == Room.RoomStatus.DIRTY)
                    .count();
            
            // 보수 중: status = MAINTENANCE (객실 기준만 사용)
            long maintenanceCount = allRooms.stream()
                    .filter(r -> r.getStatus() == Room.RoomStatus.MAINTENANCE)
                    .count();
            
            // 현재 사용 중인 객실: CHECKED_IN 상태의 예약이 있고 체크아웃 날짜가 아직 지나지 않은 객실
            // (이 항목은 예약 기준이므로 유지)
            long inUseCount = allRooms.stream()
                    .filter(r -> r.getBookings().stream()
                            .anyMatch(b -> b.getStatus() == Booking.BookingStatus.CHECKED_IN &&
                                    !b.getCheckOutDate().isBefore(today)))
                    .count();

            return DashboardDTO.RoomStatusSummaryDTO.builder()
                    .booked(bookedCount)
                    .available(availableCount)
                    .cleaningNeeded(cleaningNeededCount)
                    .maintenance(maintenanceCount)
                    .inUse(inUseCount)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("객실 상태 조회 실패: " + e.getMessage() + 
                    ". 데이터베이스 마이그레이션이 필요할 수 있습니다. " +
                    "migrate_room_status_postgresql.sql 파일을 실행하세요.", e);
        }
    }

    // 객실 관리
    public List<RoomDTO> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::convertToRoomDTO)
                .collect(Collectors.toList());
    }

    public RoomDTO getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("객실을 찾을 수 없습니다"));
        return convertToRoomDTO(room);
    }

    @Transactional
    public RoomDTO createRoom(RoomDTO roomDTO) {
        Room room = Room.builder()
                .name(roomDTO.getName())
                .description(roomDTO.getDescription())
                .type(roomDTO.getType())
                .capacity(roomDTO.getCapacity())
                .pricePerNight(roomDTO.getPricePerNight())
                .available(true)
                .status(Room.RoomStatus.CLEAN)
                .imageUrl(roomDTO.getImageUrl())
                .viewType(roomDTO.getViewType())
                .bedCount(roomDTO.getBedCount())
                .build();
        room = roomRepository.save(room);
        return convertToRoomDTO(room);
    }

    @Transactional
    public RoomDTO updateRoom(Long id, RoomDTO roomDTO) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("객실을 찾을 수 없습니다"));
        room.setName(roomDTO.getName());
        room.setDescription(roomDTO.getDescription());
        room.setType(roomDTO.getType());
        room.setCapacity(roomDTO.getCapacity());
        room.setPricePerNight(roomDTO.getPricePerNight());
        room.setImageUrl(roomDTO.getImageUrl());
        room.setViewType(roomDTO.getViewType());
        room.setBedCount(roomDTO.getBedCount());
        if (roomDTO.getStatus() != null) {
            room.setStatus(roomDTO.getStatus());
        }
        room = roomRepository.save(room);
        return convertToRoomDTO(room);
    }

    @Transactional
    public void disableRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("객실을 찾을 수 없습니다"));
        room.setAvailable(false);
        roomRepository.save(room);
    }

    @Transactional
    public void enableRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("객실을 찾을 수 없습니다"));
        room.setAvailable(true);
        roomRepository.save(room);
    }

    @Transactional
    public void updateRoomStatus(Long id, Room.RoomStatus status) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("객실을 찾을 수 없습니다"));
        room.setStatus(status);
        room.setStatusUpdatedAt(java.time.LocalDateTime.now());  // 상태 변경 시간 기록 (자동 청소 완료용)
        roomRepository.save(room);
        
        // 청소 완료 시 CLEAN으로 변경하면 객실은 예약 가능 상태가 됨
        // 예약 상태는 CHECKED_OUT으로 유지 (리뷰 가능 여부는 checkOutDate로 판단)
    }

    // 예약 관리
    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::convertToBookingDTO)
                .collect(Collectors.toList());
    }

    public BookingDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다"));
        return convertToBookingDTO(booking);
    }

    @Transactional
    public void updateBookingStatus(Long id, Booking.BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다"));
        booking.setStatus(status);
        bookingRepository.save(booking);
        
        // 체크아웃 처리 시 해당 객실을 청소 필요 상태로 변경
        if (status == Booking.BookingStatus.CHECKED_OUT) {
            Room room = booking.getRoom();
            room.setStatus(Room.RoomStatus.DIRTY);
            room.setStatusUpdatedAt(java.time.LocalDateTime.now());  // 상태 변경 시간 기록 (자동 청소 완료용)
            roomRepository.save(room);
        }
    }

    // 리뷰 관리
    public List<ReviewDTO> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(this::convertToReviewDTO)
                .collect(Collectors.toList());
    }

    public ReviewDTO getReviewById(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다"));
        return convertToReviewDTO(review);
    }

    @Transactional
    public void toggleReviewVisibility(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다"));
        review.setIsPublic(!review.getIsPublic());
        reviewRepository.save(review);
    }

    @Transactional
    public void createReviewReply(Long id, ReviewReplyRequest request) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다"));
        review.setAdminReply(request.getContent());
        review.setAdminReplyDate(LocalDateTime.now());
        reviewRepository.save(review);
    }

    @Transactional
    public void updateReviewReply(Long id, String content) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다"));
        review.setAdminReply(content);
        review.setAdminReplyDate(LocalDateTime.now());
        reviewRepository.save(review);
    }

    @Transactional
    public void deleteReviewReply(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다"));
        review.setAdminReply(null);
        review.setAdminReplyDate(null);
        reviewRepository.save(review);
    }

    // 공지사항 관리
    public List<NoticeDTO> getAllNotices() {
        return noticeRepository.findAll().stream()
                .map(this::convertToNoticeDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public NoticeDTO createNotice(NoticeDTO noticeDTO) {
        Notice notice = Notice.builder()
                .title(noticeDTO.getTitle())
                .content(noticeDTO.getContent())
                .important(noticeDTO.getImportant() != null ? noticeDTO.getImportant() : false)
                .type(noticeDTO.getType() != null ? noticeDTO.getType() : Notice.NoticeType.NOTICE)
                .isPublic(noticeDTO.getIsPublic() != null ? noticeDTO.getIsPublic() : true)
                .startDate(noticeDTO.getStartDate())
                .endDate(noticeDTO.getEndDate())
                .build();
        notice = noticeRepository.save(notice);
        return convertToNoticeDTO(notice);
    }

    @Transactional
    public NoticeDTO updateNotice(Long id, NoticeDTO noticeDTO) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다"));
        notice.setTitle(noticeDTO.getTitle());
        notice.setContent(noticeDTO.getContent());
        notice.setImportant(noticeDTO.getImportant() != null ? noticeDTO.getImportant() : false);
        if (noticeDTO.getType() != null) {
            notice.setType(noticeDTO.getType());
        }
        if (noticeDTO.getIsPublic() != null) {
            notice.setIsPublic(noticeDTO.getIsPublic());
        }
        notice.setStartDate(noticeDTO.getStartDate());
        notice.setEndDate(noticeDTO.getEndDate());
        notice = noticeRepository.save(notice);
        return convertToNoticeDTO(notice);
    }

    @Transactional
    public void deleteNotice(Long id) {
        noticeRepository.deleteById(id);
    }

    @Transactional
    public void toggleNoticeVisibility(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다"));
        notice.setIsPublic(!notice.getIsPublic());
        noticeRepository.save(notice);
    }

    // 공통 계산 메서드
    private long calculateBookedCount(LocalDate today) {
        // 예약(booked): CONFIRMED + 미래/오늘 체크인 (예약 기준만 사용, 객실 상태와 무관)
        return bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED &&
                        !b.getCheckInDate().isBefore(today))
                .count();
    }

    // 변환 메서드들
    private BookingDTO convertToBookingDTO(Booking booking) {
        BookingDTO dto = BookingDTO.builder()
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
                .build();
        
        if (booking.getPayment() != null) {
            Payment payment = booking.getPayment();
            dto.setPayment(com.hotel.booking.payment.dto.PaymentDTO.builder()
                    .id(payment.getId())
                    .amount(payment.getAmount())
                    .method(payment.getMethod())
                    .status(payment.getStatus())
                    .paymentDate(payment.getPaymentDate())
                    .transactionId(payment.getTransactionId())
                    .build());
        }
        
        return dto;
    }

    private List<DashboardDTO.BookingSummaryDTO> convertToBookingSummary(List<Booking> bookings) {
        return bookings.stream()
                .map(b -> DashboardDTO.BookingSummaryDTO.builder()
                        .id(b.getId())
                        .roomName(b.getRoom().getName())
                        .userName(b.getUser().getNickname())
                        .checkInDate(b.getCheckInDate().toString())
                        .checkOutDate(b.getCheckOutDate().toString())
                        .build())
                .collect(Collectors.toList());
    }

    private RoomDTO convertToRoomDTO(Room room) {
        return RoomDTO.builder()
                .id(room.getId())
                .name(room.getName())
                .description(room.getDescription())
                .type(room.getType())
                .capacity(room.getCapacity())
                .pricePerNight(room.getPricePerNight())
                .available(room.getAvailable())
                .status(room.getStatus())
                .imageUrl(room.getImageUrl())
                .viewType(room.getViewType())
                .bedCount(room.getBedCount())
                .build();
    }

    private ReviewDTO convertToReviewDTO(Review review) {
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

    private NoticeDTO convertToNoticeDTO(Notice notice) {
        return NoticeDTO.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .important(notice.getImportant())
                .type(notice.getType())
                .isPublic(notice.getIsPublic())
                .startDate(notice.getStartDate())
                .endDate(notice.getEndDate())
                .createdAt(notice.getCreatedAt())
                .updatedAt(notice.getUpdatedAt())
                .build();
    }
}

