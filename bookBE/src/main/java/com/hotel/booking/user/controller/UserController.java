package com.hotel.booking.user.controller;

import com.hotel.booking.common.dto.ApiResponse;
import com.hotel.booking.common.util.JwtUtil;
import com.hotel.booking.user.dto.UserDTO;
import com.hotel.booking.user.dto.UserUpdateRequest;
import com.hotel.booking.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMyProfile(HttpServletRequest httpRequest) {
        String userId = getUserIdFromRequest(httpRequest);
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateMyProfile(
            @RequestBody UserUpdateRequest request,
            HttpServletRequest httpRequest) {
        String userId = getUserIdFromRequest(httpRequest);
        return ResponseEntity.ok(userService.updateUserProfile(
                userId,
                request.getEmail(),
                request.getNickname(),
                request.getPassword(),
                request.getCurrentPassword()
        ));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<?>> deleteMyAccount(HttpServletRequest httpRequest) {
        String userId = getUserIdFromRequest(httpRequest);
        userService.deleteUser(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, null, "회원 탈퇴가 완료되었습니다."));
    }

    private String getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.getIdFromToken(token);
        }
        throw new RuntimeException("인증 토큰이 없습니다");
    }
}

