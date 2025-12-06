package com.hotel.booking.booking.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 예약 관련 스케줄러 서비스
 * 
 * PENDING 상태가 제거되어 자동 취소 스케줄러는 더 이상 필요하지 않음
 * COMPLETED 상태가 제거되어 자동 완료 스케줄러도 더 이상 필요하지 않음
 * 예약 상태는 관리자가 수동으로 체크인/체크아웃 처리
 */
@Service
@Slf4j
public class BookingSchedulerService {
    // 현재 사용 중인 스케줄러 없음
}

