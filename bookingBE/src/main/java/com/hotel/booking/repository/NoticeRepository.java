package com.hotel.booking.repository;

import com.hotel.booking.entity.Notice;
import com.hotel.booking.entity.Notice.NoticeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    List<Notice> findByVisibleTrueOrderByCreatedAtDesc();
    List<Notice> findByNoticeTypeAndVisibleTrueOrderByCreatedAtDesc(NoticeType noticeType);
    
    @Query("SELECT n FROM Notice n WHERE n.visible = true " +
           "AND (n.startDate IS NULL OR n.startDate <= :date) " +
           "AND (n.endDate IS NULL OR n.endDate >= :date) " +
           "ORDER BY n.createdAt DESC")
    List<Notice> findActiveNotices(@Param("date") LocalDate date);
}

