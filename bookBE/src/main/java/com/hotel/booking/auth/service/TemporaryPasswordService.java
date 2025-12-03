package com.hotel.booking.auth.service;

import com.hotel.booking.user.entity.User;
import com.hotel.booking.user.repository.UserRepository;
import com.hotel.booking.user.service.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;

@Service
@RequiredArgsConstructor
public class TemporaryPasswordService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;

    /**
     * 이메일로 임시 비밀번호 생성/저장/발송
     */
    @Transactional
    public void issueAndSend(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("가입된 이메일을 찾을 수 없습니다."));

        String tempPassword = generateTempPassword(12); // 12자리 임시 비밀번호
        user.setPassword(passwordEncoder.encode(tempPassword)); // 기존 비밀번호 덮어쓰기
        userRepository.save(user);

        // 이메일 발송
        String subject = "[호텔 예약 시스템] 임시 비밀번호가 발급되었습니다";
        String body = String.format(
                "안녕하세요. 호텔 예약 시스템입니다.\n\n" +
                "아래 임시 비밀번호로 로그인하신 후\n" +
                "마이페이지 > 비밀번호 변경에서 새 비밀번호로 교체해 주세요.\n\n" +
                "임시 비밀번호: %s\n\n" +
                "안전을 위해 다른 사람과 공유하지 마세요.",
                tempPassword
        );

        mailService.send(email, subject, body);
    }

    /**
     * 12자리 임시 비밀번호 생성 (영문+숫자)
     */
    private String generateTempPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}

