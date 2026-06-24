package com.example.demo.dto.trip;

import com.example.demo.entity.Trip;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "내 여행 목록 카드 응답 DTO")
public record TripSummaryResponse(

        Long id,
        String title,
        String region,
        String period,
        String style,
        String coverImage,
        boolean isPublic,
        LocalDateTime createdAt
) {
    public static TripSummaryResponse from(Trip trip) {
        return new TripSummaryResponse(
                trip.getId(),
                trip.getTitle(),
                trip.getRegion(),
                trip.getPeriod(),
                trip.getStyle(),
                trip.getCoverImage(),
                trip.isPublic(),
                trip.getCreatedAt()
        );
    }
}
