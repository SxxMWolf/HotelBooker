package com.hotel.booking.room.service;

import com.hotel.booking.room.dto.RoomDTO;
import com.hotel.booking.room.entity.Room;
import com.hotel.booking.room.repository.RoomRepository;
import com.hotel.booking.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public List<RoomDTO> getAllRooms() {
        List<Room> allRooms = roomRepository.findAll();
        return getUniqueRoomsByType(allRooms, null, null);
    }

    @Transactional(readOnly = true)
    public List<RoomDTO> getAvailableRooms(LocalDate checkInDate, LocalDate checkOutDate) {
        if (checkInDate == null || checkOutDate == null) {
            return getAllRooms();
        }
        List<Room> availableRooms = roomRepository.findAvailableRooms(checkInDate, checkOutDate);
        List<Room> allRooms = roomRepository.findAll();
        return getUniqueRoomsByType(allRooms, availableRooms, checkInDate);
    }

    /**
     * 타입별로 그룹화하여 각 타입당 1개씩만 반환
     * available한 방이 있으면 available한 방 1개 반환
     * available한 방이 없으면 allBooked = true로 설정하여 반환
     */
    private List<RoomDTO> getUniqueRoomsByType(List<Room> allRooms, List<Room> availableRooms, LocalDate checkInDate) {
        // 타입별로 그룹화
        Map<String, List<Room>> roomsByType = allRooms.stream()
                .collect(Collectors.groupingBy(Room::getType));

        return roomsByType.entrySet().stream()
                .map(entry -> {
                    List<Room> roomsOfType = entry.getValue();
                    
                    // available한 방 찾기
                    Room availableRoom = null;
                    if (availableRooms != null) {
                        availableRoom = roomsOfType.stream()
                                .filter(availableRooms::contains)
                                .findFirst()
                                .orElse(null);
                    } else {
                        availableRoom = roomsOfType.stream()
                                .filter(Room::getAvailable)
                                .findFirst()
                                .orElse(null);
                    }
                    
                    // available한 방이 있으면 해당 방 반환, 없으면 첫 번째 방 반환 (allBooked = true)
                    Room roomToReturn = availableRoom != null ? availableRoom : roomsOfType.get(0);
                    RoomDTO dto = convertToDTO(roomToReturn);
                    dto.setAllBooked(availableRoom == null);
                    return dto;
                })
                .sorted(Comparator.comparing(RoomDTO::getPricePerNight))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoomDTO getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("객실을 찾을 수 없습니다"));
        return convertToDTO(room);
    }

    @Transactional(readOnly = true)
    public List<RoomDTO> getRoomsByTypeAndViewType(String type, String viewType, LocalDate checkInDate, LocalDate checkOutDate) {
        List<Room> rooms = roomRepository.findByTypeAndViewType(type, viewType);
        
        // 날짜가 제공된 경우 예약 가능한 방만 필터링
        if (checkInDate != null && checkOutDate != null) {
            List<Room> availableRooms = roomRepository.findAvailableRooms(checkInDate, checkOutDate);
            rooms = rooms.stream()
                    .filter(availableRooms::contains)
                    .collect(Collectors.toList());
        } else {
            // 날짜가 없으면 available = true인 방만 필터링
            rooms = rooms.stream()
                    .filter(Room::getAvailable)
                    .collect(Collectors.toList());
        }
        
        return rooms.stream()
                .map(this::convertToDTO)
                .sorted(Comparator.comparing(RoomDTO::getPricePerNight))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RoomDTO> getRoomsByType(String type, LocalDate checkInDate, LocalDate checkOutDate) {
        List<Room> rooms = roomRepository.findByType(type);
        
        // 날짜가 제공된 경우 예약 가능한 방만 필터링
        if (checkInDate != null && checkOutDate != null) {
            List<Room> availableRooms = roomRepository.findAvailableRooms(checkInDate, checkOutDate);
            rooms = rooms.stream()
                    .filter(availableRooms::contains)
                    .collect(Collectors.toList());
        } else {
            // 날짜가 없으면 available = true인 방만 필터링
            rooms = rooms.stream()
                    .filter(Room::getAvailable)
                    .collect(Collectors.toList());
        }
        
        return rooms.stream()
                .map(this::convertToDTO)
                .sorted(Comparator.comparing(RoomDTO::getPricePerNight))
                .collect(Collectors.toList());
    }

    private RoomDTO convertToDTO(Room room) {
        // 같은 타입의 모든 방에 대한 리뷰를 가져옴
        List<Room> roomsOfSameType = roomRepository.findAll().stream()
                .filter(r -> r.getType().equals(room.getType()))
                .collect(Collectors.toList());
        
        List<com.hotel.booking.review.entity.Review> allReviews = roomsOfSameType.stream()
                .flatMap(r -> reviewRepository.findByRoomId(r.getId()).stream())
                .collect(Collectors.toList());
        
        Double averageRating = allReviews.isEmpty() ? null : 
            allReviews.stream().mapToInt(com.hotel.booking.review.entity.Review::getRating).average().orElse(0.0);

        return RoomDTO.builder()
                .id(room.getId())
                .name(room.getName())
                .description(room.getDescription())
                .type(room.getType())
                .capacity(room.getCapacity())
                .pricePerNight(room.getPricePerNight())
                .available(room.getAvailable())
                .imageUrl(room.getImageUrl())
                .averageRating(averageRating)
                .reviewCount(allReviews.size())
                .allBooked(false) // 기본값, getUniqueRoomsByType에서 설정됨
                .viewType(room.getViewType())
                .bedCount(room.getBedCount())
                .build();
    }
}

