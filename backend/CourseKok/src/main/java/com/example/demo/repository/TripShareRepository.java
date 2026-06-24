package com.example.demo.repository;

import com.example.demo.entity.Trip;
import com.example.demo.entity.TripShare;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TripShareRepository extends JpaRepository<TripShare, Long> {
    Optional<TripShare> findByTrip(Trip trip);
    Optional<TripShare> findByTokenAndStatus(String token, String status);
}
