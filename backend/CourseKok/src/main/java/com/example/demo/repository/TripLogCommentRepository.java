package com.example.demo.repository;

import com.example.demo.entity.TripLogComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TripLogCommentRepository extends JpaRepository<TripLogComment, Long> {

    Page<TripLogComment> findByTripLogIdOrderByCreatedAtDesc(Long tripLogId, Pageable pageable);

    Optional<TripLogComment> findByIdAndUserId(Long id, Long userId);
}
