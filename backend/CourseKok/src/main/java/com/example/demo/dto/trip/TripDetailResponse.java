package com.example.demo.dto.trip;

import com.example.demo.entity.Trip;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "내 여행 상세 응답 DTO (aiPlanSnapshot 포함)")
public record TripDetailResponse(

        Long id,
        String title,
        String region,
        String period,
        String style,
        String coverImage,
        boolean isPublic,
        String aiPlanSnapshot,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static TripDetailResponse from(Trip trip) {
        return new TripDetailResponse(
                trip.getId(),
                trip.getTitle(),
                trip.getRegion(),
                trip.getPeriod(),
                trip.getStyle(),
                trip.getCoverImage(),
                trip.isPublic(),
                trip.getAiPlanSnapshot(),
                trip.getCreatedAt(),
                trip.getUpdatedAt()
        );
    }
}
