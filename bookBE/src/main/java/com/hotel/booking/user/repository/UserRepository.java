package com.hotel.booking.user.repository;

import com.hotel.booking.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findById(String id);
    Optional<User> findByEmail(String email);
    boolean existsById(String id);
    boolean existsByEmail(String email);
}

