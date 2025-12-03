package com.hotel.booking.auth.service;

import com.hotel.booking.auth.entity.EmailVerification;
import com.hotel.booking.auth.repository.EmailVerificationRepository;
import com.hotel.booking.user.service.MailService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationService {
    private final EmailVerificationRepository emailVerificationRepository;
    private final MailService mailService;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Value("${spring.mail.username:}")
    private String mailUsername;

    /**
     * 이메일 인증 코드 생성 및 발송
     */
    @Transactional
    public void sendVerificationCode(String email) {
        // 6자리 인증 코드 생성
        String code = generateVerificationCode();
        
        log.info("인증 코드 생성 시작: email={}", email);

        // 기존 인증 정보 삭제 (unique 제약 조건을 피하기 위해 먼저 삭제)
        emailVerificationRepository.deleteByEmail(email);
        // 삭제가 데이터베이스에 즉시 반영되도록 flush 및 clear
        entityManager.flush();
        entityManager.clear();
        log.debug("기존 인증 정보 삭제 완료: {}", email);

        // 새 인증 정보 저장 (5분 유효)
        EmailVerification verification = EmailVerification.builder()
                .email(email)
                .code(code)
                .verified(false)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();

        emailVerificationRepository.saveAndFlush(verification);
        log.info("인증 코드 저장 완료: email={}", email);
        
        // 이메일 발송 (트랜잭션 내에서 실행하되, 실패해도 롤백하지 않음)
        sendEmailSafely(email, code);
    }

    /**
     * 이메일 발송 (안전하게 처리, 실패해도 트랜잭션에 영향 없음)
     */
    private void sendEmailSafely(String email, String code) {
        // 이메일 발송
        String subject = "[호텔 예약 시스템] 이메일 인증 코드";
        String body = String.format(
                "안녕하세요.\n\n" +
                "이메일 인증 코드는 다음과 같습니다:\n\n" +
                "인증 코드: %s\n\n" +
                "이 코드는 5분간 유효합니다.\n" +
                "타인에게 노출되지 않도록 주의해주세요.",
                code
        );

        // 이메일 설정이 되어 있으면 발송, 없으면 콘솔에만 출력 (개발 환경용)
        if (mailUsername != null && !mailUsername.isEmpty() && !mailUsername.contains("your-email") && !mailUsername.startsWith("${")) {
            try {
                mailService.send(email, subject, body);
                log.info("이메일 인증 코드 발송 성공: {}", email);
            } catch (Exception e) {
                log.error("이메일 발송 실패, 콘솔에 인증 코드 출력: {}", e.getMessage());
                log.info("========================================");
                log.info("이메일 인증 코드 (개발용)");
                log.info("이메일: {}", email);
                log.info("인증 코드: {}", code);
                log.info("========================================");
                // 이메일 발송 실패는 예외를 던지지 않음 (트랜잭션에 영향 없음)
            }
        } else {
            // 이메일 설정이 안 되어 있으면 콘솔에만 출력
            log.warn("이메일 설정이 되어 있지 않습니다. 환경 변수 MAIL_USERNAME과 MAIL_PASSWORD를 설정해주세요.");
            log.info("========================================");
            log.info("이메일 인증 코드 (개발용)");
            log.info("이메일: {}", email);
            log.info("인증 코드: {}", code);
            log.info("========================================");
        }
    }


    /**
     * 인증 코드 확인
     */
    @Transactional
    public boolean verifyCode(String email, String code) {
        Optional<EmailVerification> verificationOpt = 
                emailVerificationRepository.findByEmailAndCode(email, code);

        if (verificationOpt.isEmpty()) {
            return false;
        }

        EmailVerification verification = verificationOpt.get();

        // 만료 시간 확인
        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }

        // 인증 완료 처리
        verification.setVerified(true);
        emailVerificationRepository.save(verification);

        return true;
    }

    /**
     * 이메일 인증 완료 여부 확인
     */
    public boolean isEmailVerified(String email) {
        Optional<EmailVerification> verificationOpt = 
                emailVerificationRepository.findByEmail(email);

        if (verificationOpt.isEmpty()) {
            return false;
        }

        EmailVerification verification = verificationOpt.get();
        return verification.getVerified() && 
               verification.getExpiresAt().isAfter(LocalDateTime.now());
    }

    /**
     * 6자리 인증 코드 생성
     */
    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 100000 ~ 999999
        return String.valueOf(code);
    }
}

