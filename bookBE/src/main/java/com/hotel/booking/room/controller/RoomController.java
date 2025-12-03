package com.hotel.booking.room.controller;

import com.hotel.booking.room.dto.RoomDTO;
import com.hotel.booking.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<List<RoomDTO>> getAllRooms(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate) {
        if (checkInDate != null && checkOutDate != null) {
            return ResponseEntity.ok(roomService.getAvailableRooms(checkInDate, checkOutDate));
        }
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomDTO> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<RoomDTO>> getRoomsByType(
            @PathVariable String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate) {
        return ResponseEntity.ok(roomService.getRoomsByType(type, checkInDate, checkOutDate));
    }

    @GetMapping("/type/{type}/view/{viewType}")
    public ResponseEntity<List<RoomDTO>> getRoomsByTypeAndViewType(
            @PathVariable String type,
            @PathVariable String viewType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate) {
        return ResponseEntity.ok(roomService.getRoomsByTypeAndViewType(type, viewType, checkInDate, checkOutDate));
    }
}

