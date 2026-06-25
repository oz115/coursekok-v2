package com.example.demo.repository;

import com.example.demo.entity.TripLog;
import com.example.demo.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TripLogRepository extends JpaRepository<TripLog, Long> {

    // 공개 피드 (최신순)
    Page<TripLog> findByIsPublicTrueOrderByCreatedAtDesc(Pageable pageable);

    // 공개 피드 (좋아요순)
    Page<TripLog> findByIsPublicTrueOrderByLikeCountDesc(Pageable pageable);

    // 공개 피드 (사진 많은순 — place_logs 수 기준)
    @Query("SELECT tl FROM TripLog tl WHERE tl.isPublic = true ORDER BY SIZE(tl.placeLogs) DESC")
    Page<TripLog> findByIsPublicTrueOrderByPlaceLogsCountDesc(Pageable pageable);

    // 공개 피드 (스크랩순)
    Page<TripLog> findByIsPublicTrueOrderByCopyCountDesc(Pageable pageable);

    // 지역 필터 포함 최신순
    Page<TripLog> findByIsPublicTrueAndRegionOrderByCreatedAtDesc(String region, Pageable pageable);

    // 내 여행기 목록
    List<TripLog> findByUserOrderByCreatedAtDesc(User user);

    Optional<TripLog> findByIdAndUser(Long id, User user);

    // 특정 trip 에서 생성된 triplog
    @Query("SELECT tl FROM TripLog tl WHERE tl.trip.id = :tripId AND tl.isPublic = true")
    List<TripLog> findPublicByTripId(@Param("tripId") Long tripId);

    // 내 여행에 연결된 기록 조회 (비공개 포함)
    Optional<TripLog> findFirstByTripIdAndUser(Long tripId, User user);
}
