package com.hotel.booking.controller;

import com.hotel.booking.dto.*;
import com.hotel.booking.entity.User;
import com.hotel.booking.repository.UserRepository;
import com.hotel.booking.service.EmailVerificationService;
import com.hotel.booking.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;
    private final JwtUtil jwtUtil;

    /**
     * 이메일 인증 코드 발송
     * - 회원가입, 아이디 찾기, 비밀번호 찾기 등에서 사용
     * - 같은 이메일로 여러 번 요청 가능 (제한 없음)
     * - 기존 인증 코드가 있으면 자동으로 삭제하고 새 코드 발송
     */
    @PostMapping("/send-verification-code")
    public ResponseEntity<ApiResponse<?>> sendVerificationCode(
            @Valid @RequestBody EmailVerificationRequest request) {
        try {
            // 인증 코드 생성 및 저장 (트랜잭션 내)
            // 기존 인증 코드가 있으면 자동으로 삭제하고 새 코드 생성
            emailVerificationService.sendVerificationCode(request.getEmail());
            
            // 이메일 발송은 트랜잭션 커밋 후 실행 (별도 메서드로 분리)
            // 인증 코드는 이미 저장되었으므로 성공으로 처리
            return ResponseEntity.ok(
                    new ApiResponse<>(true, null, "인증 코드가 생성되었습니다. 이메일 설정이 되어 있지 않으면 서버 로그를 확인해주세요.")
            );
        } catch (Exception e) {
            log.error("인증 코드 발송 중 예외 발생", e);
            String errorMessage = "인증 코드 생성 중 오류가 발생했습니다.";
            if (e.getMessage() != null) {
                errorMessage += " " + e.getMessage();
            }
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, null, errorMessage)
            );
        }
    }

    /**
     * 이메일 인증 코드 확인
     */
    @PostMapping("/verify-code")
    public ResponseEntity<ApiResponse<?>> verifyCode(
            @Valid @RequestBody EmailVerificationCodeRequest request) {
        boolean verified = emailVerificationService.verifyCode(
                request.getEmail(), request.getCode());

        if (verified) {
            return ResponseEntity.ok(
                    new ApiResponse<>(true, null, "이메일 인증이 완료되었습니다.")
            );
        } else {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, null, "인증 코드가 올바르지 않거나 만료되었습니다.")
            );
        }
    }

    /**
     * 회원가입
     * - 회원가입 시에만 users 테이블의 이메일 중복 체크 수행
     * - 한 이메일로 계정은 1개만 생성 가능
     * - 회원탈퇴 후에는 같은 이메일로 재가입 가능 (탈퇴 시 user 삭제되므로 unique 제약 해제)
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<?>> signup(@Valid @RequestBody SignupRequest request) {
        // 1) 이메일 중복 체크 (회원가입 시에만 수행)
        // 탈퇴한 사용자의 이메일은 이미 삭제되었으므로 재가입 가능
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, null, "이미 사용 중인 이메일입니다.")
            );
        }

        // 2) 아이디 중복 체크
        if (userRepository.existsById(request.getId())) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, null, "이미 사용 중인 아이디입니다.")
            );
        }

        // 3) 이메일 인증 여부 체크
        if (!emailVerificationService.isEmailVerified(request.getEmail())) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, null, "이메일 인증을 먼저 완료해 주세요.")
            );
        }

        // 4) 실제 유저 생성
        User user = User.builder()
                .id(request.getId())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .role(User.Role.USER)
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
        TokenResponse tokenResponse = TokenResponse.builder()
                .token(token)
                .type("Bearer")
                .expirationMs(jwtUtil.getExpirationMs())
                .role(user.getRole().name())
                .build();

        return ResponseEntity.ok(
                new ApiResponse<>(true, tokenResponse, "회원가입 성공")
        );
    }

    /**
     * 로그인
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("아이디를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, null, "비밀번호가 일치하지 않습니다.")
            );
        }

        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
        TokenResponse tokenResponse = TokenResponse.builder()
                .token(token)
                .type("Bearer")
                .expirationMs(jwtUtil.getExpirationMs())
                .role(user.getRole().name())
                .build();

        return ResponseEntity.ok(
                new ApiResponse<>(true, tokenResponse, "로그인 성공")
        );
    }
}
