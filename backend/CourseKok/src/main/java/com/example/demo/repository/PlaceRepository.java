package com.example.demo.repository;

import com.example.demo.entity.Place;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

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

    /**
     * 키워드, 시도 코드, 시군구 코드, 관광타입 ID 필터 조건에 부합하는 활성 장소 목록을 조회합니다.
     */
    @Query("SELECT p FROM Place p " +
           "WHERE (:keyword IS NULL OR :keyword = '' OR p.title LIKE %:keyword% OR p.address LIKE %:keyword%) " +
           "AND (:ldongRegnCd IS NULL OR :ldongRegnCd = '' OR p.regionCode.ldongRegnCd = :ldongRegnCd) " +
           "AND (:ldongSignguCd IS NULL OR :ldongSignguCd = '' OR p.regionCode.ldongSignguCd = :ldongSignguCd) " +
           "AND (:contentTypeId IS NULL OR p.contentTypeId = :contentTypeId) " +
           "AND (:minLng IS NULL OR p.mapX >= :minLng) " +
           "AND (:maxLng IS NULL OR p.mapX <= :maxLng) " +
           "AND (:minLat IS NULL OR p.mapY >= :minLat) " +
           "AND (:maxLat IS NULL OR p.mapY <= :maxLat) " +
           "AND p.isDeleted = false")
    Page<Place> searchPlaces(
            @Param("keyword") String keyword,
            @Param("ldongRegnCd") String ldongRegnCd,
            @Param("ldongSignguCd") String ldongSignguCd,
            @Param("contentTypeId") Integer contentTypeId,
            @Param("minLng") BigDecimal minLng,
            @Param("maxLng") BigDecimal maxLng,
            @Param("minLat") BigDecimal minLat,
            @Param("maxLat") BigDecimal maxLat,
            Pageable pageable
    );

    @Query("SELECT p FROM Place p WHERE p.regionCode.ldongRegnCd = :ldongRegnCd AND p.isDeleted = false ORDER BY p.views DESC, p.rating DESC")
    List<Place> findTopPopularPlacesInRegion(@Param("ldongRegnCd") String ldongRegnCd, Pageable pageable);

    @Query("SELECT p FROM Place p WHERE p.regionCode.ldongRegnCd = :ldongRegnCd AND p.contentTypeId = :contentTypeId AND p.isDeleted = false ORDER BY p.views DESC, p.rating DESC")
    List<Place> findTopPopularPlacesInRegionByContentType(@Param("ldongRegnCd") String ldongRegnCd, @Param("contentTypeId") Integer contentTypeId, Pageable pageable);

    @Query("SELECT p FROM Place p WHERE p.regionCode.ldongRegnCd = :ldongRegnCd AND p.contentTypeId != :excludeContentTypeId AND p.isDeleted = false ORDER BY p.views DESC, p.rating DESC")
    List<Place> findTopPopularPlacesInRegionExcludeContentType(@Param("ldongRegnCd") String ldongRegnCd, @Param("excludeContentTypeId") Integer excludeContentTypeId, Pageable pageable);

    @Query("SELECT p FROM Place p " +
           "WHERE p.regionCode.ldongRegnCd = :ldongRegnCd " +
           "AND (:ldongSignguCd IS NULL OR :ldongSignguCd = '' OR p.regionCode.ldongSignguCd = :ldongSignguCd) " +
           "AND p.contentTypeId = :contentTypeId " +
           "AND p.isDeleted = false " +
           "ORDER BY p.views DESC, p.rating DESC")
    List<Place> findTopPopularPlacesInRegionByContentType(
            @Param("ldongRegnCd") String ldongRegnCd,
            @Param("ldongSignguCd") String ldongSignguCd,
            @Param("contentTypeId") Integer contentTypeId,
            Pageable pageable);

    @Query("SELECT p FROM Place p " +
           "WHERE p.regionCode.ldongRegnCd = :ldongRegnCd " +
           "AND (:ldongSignguCd IS NULL OR :ldongSignguCd = '' OR p.regionCode.ldongSignguCd = :ldongSignguCd) " +
           "AND p.contentTypeId != :excludeContentTypeId " +
           "AND p.isDeleted = false " +
           "ORDER BY p.views DESC, p.rating DESC")
    List<Place> findTopPopularPlacesInRegionExcludeContentType(
            @Param("ldongRegnCd") String ldongRegnCd,
            @Param("ldongSignguCd") String ldongSignguCd,
            @Param("excludeContentTypeId") Integer excludeContentTypeId,
            Pageable pageable);

    @Modifying
    @Transactional
    @Query("DELETE FROM Place p WHERE p.regionCode.ldongRegnCd = :ldongRegnCd")
    void deleteByRegionCodeLdongRegnCd(@Param("ldongRegnCd") String ldongRegnCd);
}
