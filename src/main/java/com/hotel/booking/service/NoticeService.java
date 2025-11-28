package com.hotel.booking.service;

import com.hotel.booking.entity.Notice;
import com.hotel.booking.entity.User;
import com.hotel.booking.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {
    
    private final NoticeRepository noticeRepository;
    
    public List<Notice> getActiveNotices() {
        return noticeRepository.findActiveNotices(LocalDate.now());
    }
    
    public List<Notice> getAllVisibleNotices() {
        return noticeRepository.findByVisibleTrueOrderByCreatedAtDesc();
    }
    
    public List<Notice> getNoticesByType(Notice.NoticeType noticeType) {
        return noticeRepository.findByNoticeTypeAndVisibleTrueOrderByCreatedAtDesc(noticeType);
    }
    
    public Optional<Notice> getNoticeById(Long noticeId) {
        return noticeRepository.findById(noticeId);
    }
    
    public List<Notice> getAllNotices() {
        return noticeRepository.findAll();
    }
    
    @Transactional
    public Notice createNotice(String title, String content, Notice.NoticeType noticeType,
                              String imageUrl, LocalDate startDate, LocalDate endDate, User createdBy) {
        Notice notice = Notice.builder()
                .title(title)
                .content(content)
                .noticeType(noticeType)
                .imageUrl(imageUrl)
                .startDate(startDate)
                .endDate(endDate)
                .visible(true)
                .createdBy(createdBy)
                .build();
        
        return noticeRepository.save(notice);
    }
    
    @Transactional
    public Notice updateNotice(Notice notice, String title, String content, 
                              Notice.NoticeType noticeType, String imageUrl,
                              LocalDate startDate, LocalDate endDate, Boolean visible) {
        notice.setTitle(title);
        notice.setContent(content);
        notice.setNoticeType(noticeType);
        if (imageUrl != null && !imageUrl.isEmpty()) {
            notice.setImageUrl(imageUrl);
        }
        notice.setStartDate(startDate);
        notice.setEndDate(endDate);
        notice.setVisible(visible);
        
        return noticeRepository.save(notice);
    }
    
    @Transactional
    public void deleteNotice(Long noticeId) {
        noticeRepository.deleteById(noticeId);
    }
}

