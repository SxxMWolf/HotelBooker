package com.hotel.booking.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {
    private final JavaMailSender mailSender;

    public void send(String to, String subject, String body) {
        if (mailSender == null) {
            log.error("JavaMailSender가 초기화되지 않았습니다. 이메일 설정을 확인해주세요.");
            throw new RuntimeException("이메일 발송 서비스가 설정되지 않았습니다.");
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("이메일 발송 성공: {}", to);
        } catch (Exception e) {
            log.error("이메일 발송 실패: {}", e.getMessage(), e);
            throw new RuntimeException("이메일 발송에 실패했습니다: " + e.getMessage(), e);
        }
    }
}

