package com.hotel.booking.service;

import com.hotel.booking.entity.Room;
import com.hotel.booking.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomService {
    
    private final RoomRepository roomRepository;
    
    public List<Room> getAllActiveRooms() {
        return roomRepository.findByActiveTrue();
    }
    
    public Optional<Room> getRoomById(Long roomId) {
        return roomRepository.findById(roomId);
    }
    
    public List<Room> getAvailableRooms(LocalDate checkInDate, LocalDate checkOutDate) {
        return roomRepository.findAvailableRooms(checkInDate, checkOutDate);
    }
    
    @Transactional
    public Room createRoom(String roomNumber, String roomName, Room.RoomType roomType,
                          String description, Integer maxGuests, BigDecimal pricePerNight,
                          String imageUrl, String amenities) {
        Room room = Room.builder()
                .roomNumber(roomNumber)
                .roomName(roomName)
                .roomType(roomType)
                .description(description)
                .maxGuests(maxGuests)
                .pricePerNight(pricePerNight)
                .imageUrl(imageUrl)
                .amenities(amenities)
                .status(Room.RoomStatus.AVAILABLE)
                .active(true)
                .build();
        
        return roomRepository.save(room);
    }
    
    @Transactional
    public Room updateRoom(Room room, String roomName, Room.RoomType roomType,
                          String description, Integer maxGuests, BigDecimal pricePerNight,
                          String imageUrl, String amenities, Room.RoomStatus status,
                          Boolean cleaningNeeded, Boolean active) {
        room.setRoomName(roomName);
        room.setRoomType(roomType);
        room.setDescription(description);
        room.setMaxGuests(maxGuests);
        room.setPricePerNight(pricePerNight);
        if (imageUrl != null && !imageUrl.isEmpty()) {
            room.setImageUrl(imageUrl);
        }
        room.setAmenities(amenities);
        room.setStatus(status);
        room.setCleaningNeeded(cleaningNeeded);
        room.setActive(active);
        
        return roomRepository.save(room);
    }
    
    @Transactional
    public void deleteRoom(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("객실을 찾을 수 없습니다."));
        room.setActive(false);
        roomRepository.save(room);
    }
}

