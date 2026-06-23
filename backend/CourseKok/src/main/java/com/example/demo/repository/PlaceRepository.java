package com.example.demo.repository;

import com.example.demo.entity.Place;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlaceRepository extends JpaRepository<Place, Long> {
    
    /**
     * 외부 시스템 연동 고유 식별 키(contentId)로 장소를 조회합니다.
     *
     * @param contentId 외부 시스템 연동 고유 식별 키
     * @return 장소 정보 Optional
     */
    Optional<Place> findByContentId(String contentId);
}
