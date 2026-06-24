package com.example.demo.repository;

import com.example.demo.entity.TripLogBookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TripLogBookmarkRepository extends JpaRepository<TripLogBookmark, Long> {

    boolean existsByTripLogIdAndUserId(Long tripLogId, Long userId);

    Optional<TripLogBookmark> findByTripLogIdAndUserId(Long tripLogId, Long userId);
}
