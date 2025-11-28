package com.hotel.booking.controller;

import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Payment;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.User;
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
@RequestMapping("/customer")
@RequiredArgsConstructor
public class CustomerController {
    
    private final RoomService roomService;
    private final BookingService bookingService;
    private final PaymentService paymentService;
    private final ReviewService reviewService;
    private final NoticeService noticeService;
    private final UserService userService;
    private final UserRepository userRepository;
    
    @GetMapping("/rooms")
    public String rooms(@RequestParam(required = false) String checkIn,
                       @RequestParam(required = false) String checkOut,
                       Model model) {
        List<Room> rooms;
        if (checkIn != null && checkOut != null && !checkIn.isEmpty() && !checkOut.isEmpty()) {
            LocalDate checkInDate = LocalDate.parse(checkIn);
            LocalDate checkOutDate = LocalDate.parse(checkOut);
            rooms = roomService.getAvailableRooms(checkInDate, checkOutDate);
            model.addAttribute("checkIn", checkIn);
            model.addAttribute("checkOut", checkOut);
        } else {
            rooms = roomService.getAllActiveRooms();
        }
        
        model.addAttribute("rooms", rooms);
        return "customer/rooms";
    }
    
    @GetMapping("/rooms/{id}")
    public String roomDetail(@PathVariable Long id, Model model) {
        Room room = roomService.getRoomById(id)
                .orElseThrow(() -> new IllegalArgumentException("객실을 찾을 수 없습니다."));
        model.addAttribute("room", room);
        model.addAttribute("reviews", reviewService.getVisibleReviewsByRoom(room));
        return "customer/room-detail";
    }
    
    @PostMapping("/bookings")
    public String createBooking(Authentication authentication,
                               @RequestParam Long roomId,
                               @RequestParam String checkInDate,
                               @RequestParam String checkOutDate,
                               @RequestParam Integer numGuests,
                               @RequestParam(required = false) String specialRequests,
                               RedirectAttributes redirectAttributes) {
        try {
            User user = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
            
            Booking booking = bookingService.createBooking(
                    user, roomId, LocalDate.parse(checkInDate), 
                    LocalDate.parse(checkOutDate), numGuests, specialRequests);
            
            return "redirect:/customer/bookings/" + booking.getBookingId() + "/payment";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/customer/rooms/" + roomId;
        }
    }
    
    @GetMapping("/bookings/{id}/payment")
    public String paymentForm(@PathVariable Long id, Authentication authentication, Model model) {
        Booking booking = bookingService.getBookingById(id)
                .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다."));
        
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        if (!booking.getUser().getUserId().equals(user.getUserId())) {
            throw new IllegalArgumentException("예약 접근 권한이 없습니다.");
        }
        
        model.addAttribute("booking", booking);
        return "customer/payment";
    }
    
    @PostMapping("/bookings/{id}/payment")
    public String processPayment(@PathVariable Long id,
                                @RequestParam String paymentMethod,
                                @RequestParam(required = false, defaultValue = "0") BigDecimal discountAmount,
                                RedirectAttributes redirectAttributes) {
        try {
            Booking booking = bookingService.getBookingById(id)
                    .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다."));
            
            Payment.PaymentMethod method = Payment.PaymentMethod.valueOf(paymentMethod);
            paymentService.processPayment(booking, method, discountAmount);
            
            redirectAttributes.addFlashAttribute("success", "결제가 완료되었습니다.");
            return "redirect:/customer/bookings";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/customer/bookings/" + id + "/payment";
        }
    }
    
    @GetMapping("/bookings")
    public String myBookings(Authentication authentication, Model model) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        List<Booking> bookings = bookingService.getUserBookings(user);
        model.addAttribute("bookings", bookings);
        return "customer/bookings";
    }
    
    @PostMapping("/bookings/{id}/cancel")
    public String cancelBooking(@PathVariable Long id, Authentication authentication,
                               RedirectAttributes redirectAttributes) {
        try {
            User user = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
            
            bookingService.cancelBooking(id, user);
            redirectAttributes.addFlashAttribute("success", "예약이 취소되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/customer/bookings";
    }
    
    @GetMapping("/notices")
    public String notices(Model model) {
        model.addAttribute("notices", noticeService.getAllVisibleNotices());
        return "customer/notices";
    }
    
    @GetMapping("/notices/{id}")
    public String noticeDetail(@PathVariable Long id, Model model) {
        model.addAttribute("notice", noticeService.getNoticeById(id)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다.")));
        return "customer/notice-detail";
    }
    
    @GetMapping("/profile")
    public String profile(Authentication authentication, Model model) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        model.addAttribute("user", user);
        return "customer/profile";
    }
    
    @PostMapping("/profile")
    public String updateProfile(Authentication authentication,
                               @RequestParam String name,
                               @RequestParam String phone,
                               @RequestParam String email,
                               RedirectAttributes redirectAttributes) {
        try {
            User user = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
            userService.updateUser(user, name, phone, email);
            redirectAttributes.addFlashAttribute("success", "프로필이 업데이트되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/customer/profile";
    }
    
    @GetMapping("/bookings/{id}/review")
    public String reviewForm(@PathVariable Long id, Authentication authentication, Model model) {
        Booking booking = bookingService.getBookingById(id)
                .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다."));
        model.addAttribute("booking", booking);
        return "customer/review-form";
    }
    
    @PostMapping("/bookings/{id}/review")
    public String submitReview(@PathVariable Long id,
                              @RequestParam Integer rating,
                              @RequestParam String comment,
                              Authentication authentication,
                              RedirectAttributes redirectAttributes) {
        try {
            Booking booking = bookingService.getBookingById(id)
                    .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다."));
            User user = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
            
            reviewService.createReview(booking, user, booking.getRoom(), rating, comment);
            redirectAttributes.addFlashAttribute("success", "리뷰가 작성되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/customer/bookings";
    }
}

