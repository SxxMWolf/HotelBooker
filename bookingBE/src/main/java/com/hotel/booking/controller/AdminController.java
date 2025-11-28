package com.hotel.booking.controller;

import com.hotel.booking.entity.*;
import com.hotel.booking.repository.UserRepository;
import com.hotel.booking.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    
    private final BookingService bookingService;
    private final RoomService roomService;
    private final ReviewService reviewService;
    private final NoticeService noticeService;
    private final UserRepository userRepository;
    
    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        List<Booking> checkIns = bookingService.getCheckInsForToday();
        List<Booking> checkOuts = bookingService.getCheckOutsForToday();
        List<Room> allRooms = roomService.getAllActiveRooms();
        long availableRooms = allRooms.stream()
                .filter(r -> r.getStatus() == Room.RoomStatus.AVAILABLE)
                .count();
        
        model.addAttribute("checkIns", checkIns);
        model.addAttribute("checkOuts", checkOuts);
        model.addAttribute("totalRooms", allRooms.size());
        model.addAttribute("availableRooms", availableRooms);
        model.addAttribute("bookedRooms", allRooms.size() - availableRooms);
        
        return "admin/dashboard";
    }
    
    @GetMapping("/rooms")
    public String rooms(Model model) {
        model.addAttribute("rooms", roomService.getAllActiveRooms());
        return "admin/rooms";
    }
    
    @GetMapping("/rooms/new")
    public String roomForm() {
        return "admin/room-form";
    }
    
    @PostMapping("/rooms")
    public String createRoom(@RequestParam String roomNumber,
                            @RequestParam String roomName,
                            @RequestParam Room.RoomType roomType,
                            @RequestParam String description,
                            @RequestParam Integer maxGuests,
                            @RequestParam BigDecimal pricePerNight,
                            @RequestParam(required = false) String imageUrl,
                            @RequestParam(required = false) String amenities,
                            RedirectAttributes redirectAttributes) {
        try {
            roomService.createRoom(roomNumber, roomName, roomType, description, 
                                 maxGuests, pricePerNight, imageUrl, amenities);
            redirectAttributes.addFlashAttribute("success", "객실이 추가되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin/rooms";
    }
    
    @GetMapping("/rooms/{id}/edit")
    public String editRoomForm(@PathVariable Long id, Model model) {
        Room room = roomService.getRoomById(id)
                .orElseThrow(() -> new IllegalArgumentException("객실을 찾을 수 없습니다."));
        model.addAttribute("room", room);
        return "admin/room-form";
    }
    
    @PostMapping("/rooms/{id}")
    public String updateRoom(@PathVariable Long id,
                            @RequestParam String roomName,
                            @RequestParam Room.RoomType roomType,
                            @RequestParam String description,
                            @RequestParam Integer maxGuests,
                            @RequestParam BigDecimal pricePerNight,
                            @RequestParam(required = false) String imageUrl,
                            @RequestParam(required = false) String amenities,
                            @RequestParam Room.RoomStatus status,
                            @RequestParam(required = false, defaultValue = "false") Boolean cleaningNeeded,
                            @RequestParam(required = false, defaultValue = "true") Boolean active,
                            RedirectAttributes redirectAttributes) {
        try {
            Room room = roomService.getRoomById(id)
                    .orElseThrow(() -> new IllegalArgumentException("객실을 찾을 수 없습니다."));
            roomService.updateRoom(room, roomName, roomType, description, maxGuests,
                                 pricePerNight, imageUrl, amenities, status, cleaningNeeded, active);
            redirectAttributes.addFlashAttribute("success", "객실 정보가 업데이트되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin/rooms";
    }
    
    @PostMapping("/rooms/{id}/delete")
    public String deleteRoom(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            roomService.deleteRoom(id);
            redirectAttributes.addFlashAttribute("success", "객실이 삭제되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin/rooms";
    }
    
    @GetMapping("/bookings")
    public String bookings(Model model) {
        model.addAttribute("bookings", bookingService.getAllBookings());
        return "admin/bookings";
    }
    
    @PostMapping("/bookings/{id}/status")
    public String updateBookingStatus(@PathVariable Long id,
                                     @RequestParam Booking.BookingStatus status,
                                     RedirectAttributes redirectAttributes) {
        try {
            bookingService.updateBookingStatus(id, status);
            redirectAttributes.addFlashAttribute("success", "예약 상태가 업데이트되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin/bookings";
    }
    
    @GetMapping("/reviews")
    public String reviews(Model model) {
        model.addAttribute("reviews", reviewService.getAllVisibleReviews());
        model.addAttribute("hiddenReviews", reviewService.getHiddenReviews());
        return "admin/reviews";
    }
    
    @PostMapping("/reviews/{id}/visibility")
    public String updateReviewVisibility(@PathVariable Long id,
                                        @RequestParam Boolean visible,
                                        RedirectAttributes redirectAttributes) {
        try {
            reviewService.updateReviewVisibility(id, visible);
            redirectAttributes.addFlashAttribute("success", "리뷰 공개 상태가 변경되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin/reviews";
    }
    
    @PostMapping("/reviews/{id}/reply")
    public String addAdminReply(@PathVariable Long id,
                               @RequestParam String adminReply,
                               RedirectAttributes redirectAttributes) {
        try {
            reviewService.addAdminReply(id, adminReply);
            redirectAttributes.addFlashAttribute("success", "답변이 추가되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin/reviews";
    }
    
    @GetMapping("/notices")
    public String notices(Model model) {
        model.addAttribute("notices", noticeService.getAllNotices());
        return "admin/notices";
    }
    
    @GetMapping("/notices/new")
    public String noticeForm() {
        return "admin/notice-form";
    }
    
    @PostMapping("/notices")
    public String createNotice(Authentication authentication,
                              @RequestParam String title,
                              @RequestParam String content,
                              @RequestParam Notice.NoticeType noticeType,
                              @RequestParam(required = false) String imageUrl,
                              @RequestParam(required = false) String startDate,
                              @RequestParam(required = false) String endDate,
                              RedirectAttributes redirectAttributes) {
        try {
            User user = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
            
            LocalDate start = startDate != null && !startDate.isEmpty() ? LocalDate.parse(startDate) : null;
            LocalDate end = endDate != null && !endDate.isEmpty() ? LocalDate.parse(endDate) : null;
            
            noticeService.createNotice(title, content, noticeType, imageUrl, start, end, user);
            redirectAttributes.addFlashAttribute("success", "공지사항이 작성되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin/notices";
    }
    
    @GetMapping("/notices/{id}/edit")
    public String editNoticeForm(@PathVariable Long id, Model model) {
        Notice notice = noticeService.getNoticeById(id)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다."));
        model.addAttribute("notice", notice);
        return "admin/notice-form";
    }
    
    @PostMapping("/notices/{id}")
    public String updateNotice(@PathVariable Long id,
                              @RequestParam String title,
                              @RequestParam String content,
                              @RequestParam Notice.NoticeType noticeType,
                              @RequestParam(required = false) String imageUrl,
                              @RequestParam(required = false) String startDate,
                              @RequestParam(required = false) String endDate,
                              @RequestParam(required = false, defaultValue = "true") Boolean visible,
                              RedirectAttributes redirectAttributes) {
        try {
            Notice notice = noticeService.getNoticeById(id)
                    .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다."));
            
            LocalDate start = startDate != null && !startDate.isEmpty() ? LocalDate.parse(startDate) : null;
            LocalDate end = endDate != null && !endDate.isEmpty() ? LocalDate.parse(endDate) : null;
            
            noticeService.updateNotice(notice, title, content, noticeType, imageUrl, start, end, visible);
            redirectAttributes.addFlashAttribute("success", "공지사항이 업데이트되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin/notices";
    }
    
    @PostMapping("/notices/{id}/delete")
    public String deleteNotice(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            noticeService.deleteNotice(id);
            redirectAttributes.addFlashAttribute("success", "공지사항이 삭제되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin/notices";
    }
}

