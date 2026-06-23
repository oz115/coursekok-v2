package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "region_codes",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_region_codes", columnNames = {"ldong_regn_cd", "ldong_signgu_cd"})
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class RegionCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ldong_regn_cd", length = 10, nullable = false)
    private String ldongRegnCd;

    @Column(name = "ldong_regn_nm", length = 50, nullable = false)
    private String ldongRegnNm;

    @Column(name = "ldong_signgu_cd", length = 10, nullable = false)
    private String ldongSignguCd;

    @Column(name = "ldong_signgu_nm", length = 50, nullable = false)
    private String ldongSignguNm;
}
