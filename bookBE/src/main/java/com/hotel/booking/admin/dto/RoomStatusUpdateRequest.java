package com.hotel.booking.admin.dto;

import com.hotel.booking.room.entity.Room;
import lombok.Data;

@Data
public class RoomStatusUpdateRequest {
    private Room.RoomStatus status;
}

