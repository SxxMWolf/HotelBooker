package com.hotel.booking.repository;

import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.Room.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByActiveTrue();
    List<Room> findByStatusAndActiveTrue(RoomStatus status);
    Optional<Room> findByRoomNumber(String roomNumber);
    
    @Query("SELECT r FROM Room r WHERE r.active = true AND r.roomId NOT IN " +
           "(SELECT b.room.roomId FROM Booking b WHERE b.status != 'CANCELLED' " +
           "AND ((b.checkInDate <= :checkOutDate AND b.checkOutDate >= :checkInDate)))")
    List<Room> findAvailableRooms(@Param("checkInDate") LocalDate checkInDate, 
                                  @Param("checkOutDate") LocalDate checkOutDate);
}

