package com.hotel.booking.user.service;

import com.hotel.booking.user.dto.UserDTO;
import com.hotel.booking.user.entity.User;
import com.hotel.booking.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserDTO getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        return convertToDTO(user);
    }

    @Transactional
    public UserDTO updateUserProfile(String userId, String email, String nickname, String password, String currentPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        if (email != null && !email.isEmpty()) {
            user.setEmail(email);
        }
        if (nickname != null && !nickname.isEmpty()) {
            user.setNickname(nickname);
        }
        if (password != null && !password.isEmpty()) {
            // 현재 비밀번호 확인 (비밀번호 변경 시)
            if (currentPassword != null && !currentPassword.isEmpty()) {
                if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                    throw new RuntimeException("현재 비밀번호가 일치하지 않습니다.");
                }
            }
            user.setPassword(passwordEncoder.encode(password));
        }

        user = userRepository.save(user);
        return convertToDTO(user);
    }

    @Transactional
    public void deleteUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        userRepository.delete(user);
    }

    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getId())
                .email(user.getEmail())
                .name(user.getNickname())
                .phone(null)
                .role(user.getRole().name())
                .build();
    }
}

