package com.hotel.booking.room.repository;

import com.hotel.booking.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByAvailableTrue();
    
    @Query("SELECT r FROM Room r WHERE r.available = true AND r.id NOT IN " +
           "(SELECT b.room.id FROM Booking b WHERE b.status NOT IN ('CANCELLED', 'DELETED') " +
           "AND ((b.checkInDate <= :checkOutDate AND b.checkOutDate >= :checkInDate)))")
    List<Room> findAvailableRooms(@Param("checkInDate") LocalDate checkInDate, 
                                   @Param("checkOutDate") LocalDate checkOutDate);
    
    List<Room> findByTypeAndViewType(String type, String viewType);
    
    List<Room> findByType(String type);
}

