package com.example.demo.repository;

import com.example.demo.entity.TripLogLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TripLogLikeRepository extends JpaRepository<TripLogLike, Long> {

    boolean existsByTripLogIdAndUserId(Long tripLogId, Long userId);

    Optional<TripLogLike> findByTripLogIdAndUserId(Long tripLogId, Long userId);
}
