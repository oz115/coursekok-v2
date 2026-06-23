package com.example.demo.repository;

import com.example.demo.entity.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PlaceRepository extends JpaRepository<Place, Long> {
    
    /**
     * 외부 시스템 연동 고유 식별 키(contentId)로 장소를 조회합니다.
     *
     * @param contentId 외부 시스템 연동 고유 식별 키
     * @return 장소 정보 Optional
     */
    Optional<Place> findByContentId(String contentId);

    /**
     * 특정 시간 이전에 업데이트된 모든 장소(이번 배치 시점 동안 동기화되지 않은 장소)를
     * isDeleted = true 로 soft delete 처리합니다.
     *
     * @param syncStartTime 배치 동기화 시작 시간
     */
    @Modifying
    @Transactional
    @Query("UPDATE Place p SET p.isDeleted = true WHERE p.isDeleted = false AND p.updatedAt < :syncStartTime")
    void softDeleteMissingPlacesBefore(@Param("syncStartTime") LocalDateTime syncStartTime);
}
