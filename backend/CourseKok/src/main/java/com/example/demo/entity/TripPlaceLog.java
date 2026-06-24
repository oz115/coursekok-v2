package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "trip_place_logs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class TripPlaceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_log_id", nullable = false)
    private TripLog tripLog;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    private Place place;

    @Column(name = "visit_order", nullable = false)
    private int visitOrder;

    @Column(name = "day_number", nullable = false)
    private int dayNumber;

    @Column(name = "review_content", columnDefinition = "TEXT")
    private String reviewContent;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    // 스냅샷 필드 (AI 생성 장소 또는 DB 미등록 장소용)
    @Column(name = "place_title", length = 255)
    private String placeTitle;

    @Column(name = "place_category", length = 50)
    private String placeCategory;

    @Column(name = "place_image", length = 2048)
    private String placeImage;

    @Column
    private Double rating;
}
