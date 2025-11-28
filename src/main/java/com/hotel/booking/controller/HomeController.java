package com.hotel.booking.controller;

import com.hotel.booking.entity.User;
import com.hotel.booking.repository.UserRepository;
import com.hotel.booking.service.NoticeService;
import com.hotel.booking.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class HomeController {
    
    private final RoomService roomService;
    private final NoticeService noticeService;
    private final UserRepository userRepository;
    
    @GetMapping("/")
    public String home(Authentication authentication, Model model) {
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username).orElse(null);
            
            if (user != null && user.getRole() == User.Role.ADMIN) {
                return "redirect:/admin/dashboard";
            }
        }
        
        model.addAttribute("rooms", roomService.getAllActiveRooms());
        model.addAttribute("notices", noticeService.getActiveNotices());
        return "index";
    }
    
    @GetMapping("/login")
    public String login() {
        return "login";
    }
}

