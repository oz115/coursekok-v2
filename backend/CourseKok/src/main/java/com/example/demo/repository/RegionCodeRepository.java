package com.example.demo.repository;

import com.example.demo.entity.RegionCode;
import org.springframework.data.jpa.repository.JpaRepository;

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
}
