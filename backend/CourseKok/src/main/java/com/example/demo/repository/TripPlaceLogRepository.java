package com.example.demo.repository;

import com.example.demo.entity.TripPlaceLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripPlaceLogRepository extends JpaRepository<TripPlaceLog, Long> {

    List<TripPlaceLog> findByTripLogIdOrderByVisitOrderAsc(Long tripLogId);
}
