package com.hotel.booking.booking.service;

import com.hotel.booking.booking.entity.Booking;
import com.hotel.booking.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingSchedulerService {
    private final BookingRepository bookingRepository;

    // PENDING 상태가 제거되어 자동 취소 스케줄러는 더 이상 필요하지 않음

    /**
     * 체크아웃이 완료된 CONFIRMED 예약을 COMPLETED로 변경
     * 매일 자정에 실행
     */
    @Scheduled(cron = "0 0 0 * * ?") // 매일 자정에 실행
    @Transactional
    public void completeCheckedOutBookings() {
        LocalDate today = LocalDate.now();
        List<Booking> completedBookings = bookingRepository.findByStatusAndCheckOutDateBefore(
                Booking.BookingStatus.CONFIRMED, today);

        if (!completedBookings.isEmpty()) {
            log.info("{}개의 체크아웃 완료된 예약을 COMPLETED로 변경합니다.", completedBookings.size());
            for (Booking booking : completedBookings) {
                booking.setStatus(Booking.BookingStatus.COMPLETED);
                bookingRepository.save(booking);
                log.info("예약 ID {}가 COMPLETED로 변경되었습니다. (체크아웃: {})", 
                        booking.getId(), booking.getCheckOutDate());
            }
        }
    }
}

