package com.example.demo.dto.triplog;

import com.example.demo.dto.trip.TripDayResponse;
import com.example.demo.entity.TripLog;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "여행기 상세 응답 DTO")
public record TripLogDetailResponse(

        Long id,
        Long authorId,
        String authorNickname,
        String authorProfileImage,
        Long tripId,
        String title,
        String content,
        String region,
        String travelStyle,
        String coverImage,
        String mood,
        boolean isPublic,
        int viewCount,
        int likeCount,
        int copyCount,
        boolean liked,
        boolean bookmarked,
        List<TripPlaceLogResponse> placeLogs,
        List<TripDayResponse> tripPlan,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    private static String publicTravelStyle(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String key = value.replaceAll("\\s+", "").toLowerCase();
        if ("\uc218\ub3d9\uacc4\ud68d".equals(key) || "manualplan".equals(key)) {
            return null;
        }
        return value;
    }
    public static TripLogDetailResponse from(TripLog log, boolean liked, boolean bookmarked,
                                              List<TripPlaceLogResponse> placeLogs,
                                              List<TripDayResponse> tripPlan) {
        return new TripLogDetailResponse(
                log.getId(),
                log.getUser().getId(),
                log.getUser().getNickname(),
                log.getUser().getProfileImage(),
                log.getTrip() != null ? log.getTrip().getId() : null,
                log.getTitle(),
                log.getContent(),
                log.getRegion(),
                publicTravelStyle(log.getTravelStyle()),
                log.getCoverImage(),
                log.getMood(),
                log.isPublic(),
                log.getViewCount(),
                log.getLikeCount(),
                log.getCopyCount(),
                liked,
                bookmarked,
                placeLogs,
                tripPlan,
                log.getCreatedAt(),
                log.getUpdatedAt()
        );
    }
}
