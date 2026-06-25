package com.example.demo.repository;

import com.example.demo.entity.LoungeReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface LoungeReviewRepository extends JpaRepository<LoungeReview, Long> {

    Page<LoungeReview> findByLoungeSpotIdOrderByCreatedAtDesc(Long loungeSpotId, Pageable pageable);

    boolean existsByLoungeSpotIdAndUserId(Long loungeSpotId, Long userId);

    Optional<LoungeReview> findByLoungeSpotIdAndUserId(Long loungeSpotId, Long userId);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM LoungeReview r WHERE r.loungeSpot.id = :spotId")
    double findAverageRatingBySpotId(@Param("spotId") Long spotId);

    long countByLoungeSpotId(Long loungeSpotId);
}
