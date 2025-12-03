package com.hotel.booking.auth.service;

import com.hotel.booking.user.entity.User;
import com.hotel.booking.user.repository.UserRepository;
import com.hotel.booking.user.service.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IdRecoveryService {
    private final UserRepository userRepository;
    private final MailService mailService;

    /**
     * 이메일로 아이디 전송
     */
    public void sendLoginIdByEmail(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            String subject = "[호텔 예약 시스템] 아이디 안내";
            String body = String.format(
                    "안녕하세요. 호텔 예약 시스템입니다.\n\n" +
                    "요청하신 아이디는 다음과 같습니다:\n\n" +
                    "아이디: %s\n\n" +
                    "보안을 위해 이메일을 타인과 공유하지 마세요.",
                    user.getId()
            );

            mailService.send(email, subject, body);
        });
        // 존재 여부와 관계없이 동일한 응답 메시지 반환 (보안)
    }
}

