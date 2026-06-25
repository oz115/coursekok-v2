package com.example.demo.dto.trip;

import com.example.demo.entity.Trip;
import com.example.demo.entity.TripLog;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
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
        LocalDate startDate,
        LocalDate endDate,
        Long tripLogId,
        Boolean tripLogIsPublic,
        LocalDateTime createdAt
) {
    public static TripSummaryResponse from(Trip trip, TripLog tripLog) {
        return new TripSummaryResponse(
                trip.getId(),
                trip.getTitle(),
                trip.getRegion(),
                trip.getPeriod(),
                trip.getStyle(),
                trip.getCoverImage(),
                trip.isPublic(),
                trip.getStartDate(),
                trip.getEndDate(),
                tripLog != null ? tripLog.getId() : null,
                tripLog != null ? tripLog.isPublic() : null,
                trip.getCreatedAt()
        );
    }

    public static TripSummaryResponse from(Trip trip) {
        return from(trip, null);
    }
}
