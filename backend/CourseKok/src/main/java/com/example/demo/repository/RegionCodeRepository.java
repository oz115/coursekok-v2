package com.example.demo.repository;

import com.example.demo.entity.RegionCode;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.dto.place.RegionDto;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface RegionCodeRepository extends JpaRepository<RegionCode, Long> {
    
    /**
     * 법정동 시도 코드와 시군구 코드로 법정동 코드 정보를 조회합니다.
     *
     * @param ldongRegnCd   법정동 시도 코드
     * @param ldongSignguCd 법정동 시군구 코드
     * @return 법정동 코드 정보 Optional
     */
    Optional<RegionCode> findByLdongRegnCdAndLdongSignguCd(String ldongRegnCd, String ldongSignguCd);

    /**
     * 고유한 시도 목록(코드 및 이름)을 조회합니다.
     */
    @Query("SELECT DISTINCT new com.example.demo.dto.place.RegionDto(r.ldongRegnCd, r.ldongRegnNm) FROM RegionCode r ORDER BY r.ldongRegnNm ASC")
    List<RegionDto> findDistinctSidos();

    /**
     * 특정 시도에 종속된 시군구 목록(코드 및 이름)을 조회합니다.
     */
    @Query("SELECT DISTINCT new com.example.demo.dto.place.RegionDto(r.ldongSignguCd, r.ldongSignguNm) FROM RegionCode r WHERE r.ldongRegnCd = :sidoCode ORDER BY r.ldongSignguNm ASC")
    List<RegionDto> findSigungusBySidoCode(@Param("sidoCode") String sidoCode);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("DELETE FROM RegionCode r WHERE r.ldongRegnCd = :ldongRegnCd")
    void deleteByLdongRegnCd(@Param("ldongRegnCd") String ldongRegnCd);
}
