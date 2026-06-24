package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "places",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_places_content_id", columnNames = {"content_id"})
    },
    indexes = {
        @Index(name = "idx_places_region", columnList = "ldong_regn_cd, ldong_signgu_cd")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content_id", length = 50, nullable = false)
    private String contentId;

    @Column(name = "content_type_id", nullable = false)
    private Integer contentTypeId;

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "address", length = 500, nullable = false)
    private String address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns(value = {
        @JoinColumn(name = "ldong_regn_cd", referencedColumnName = "ldong_regn_cd", nullable = false),
        @JoinColumn(name = "ldong_signgu_cd", referencedColumnName = "ldong_signgu_cd", nullable = false)
    }, foreignKey = @ForeignKey(name = "fk_places_region_codes"))
    private RegionCode regionCode;

    @Column(name = "lcls_systm_1", length = 10)
    private String lclsSystm1;

    @Column(name = "lcls_systm_2", length = 10)
    private String lclsSystm2;

    @Column(name = "lcls_systm_3", length = 10)
    private String lclsSystm3;

    @Column(name = "map_x", precision = 13, scale = 10, nullable = false)
    private BigDecimal mapX;

    @Column(name = "map_y", precision = 13, scale = 10, nullable = false)
    private BigDecimal mapY;

    @Column(name = "first_image", length = 2048)
    private String firstImage;

    @Column(name = "first_image2", length = 2048)
    private String firstImage2;

    @Column(name = "cpyrht_div_cd", length = 10)
    private String cpyrhtDivCd;

    @Column(name = "tel", length = 255)
    private String tel;

    @Lob
    @Column(name = "homepage", columnDefinition = "TEXT")
    private String homepage;

    @Lob
    @Column(name = "overview", columnDefinition = "TEXT")
    private String overview;

    @Column(name = "detail_loaded_at")
    private LocalDateTime detailLoadedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder.Default
    @Column(name = "views", nullable = false)
    private Integer views = 0;

    @Builder.Default
    @Column(name = "rating", nullable = false)
    private Double rating = 0.0;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    public void updateDetail(String tel, String homepage, String overview) {
        if (tel != null && !tel.isBlank()) {
            this.tel = tel.trim();
        }
        if (homepage != null && !homepage.isBlank()) {
            this.homepage = homepage.trim();
        }
        if (overview != null && !overview.isBlank()) {
            this.overview = overview.trim();
        }
        this.detailLoadedAt = LocalDateTime.now();
    }

    public void markDetailLoaded() {
        this.detailLoadedAt = LocalDateTime.now();
    }
}
