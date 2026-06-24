package com.example.demo.dto.triplog;

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
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static TripLogDetailResponse from(TripLog log, boolean liked, boolean bookmarked,
                                              List<TripPlaceLogResponse> placeLogs) {
        return new TripLogDetailResponse(
                log.getId(),
                log.getUser().getId(),
                log.getUser().getNickname(),
                log.getUser().getProfileImage(),
                log.getTrip() != null ? log.getTrip().getId() : null,
                log.getTitle(),
                log.getContent(),
                log.getRegion(),
                log.getTravelStyle(),
                log.getCoverImage(),
                log.getMood(),
                log.isPublic(),
                log.getViewCount(),
                log.getLikeCount(),
                log.getCopyCount(),
                liked,
                bookmarked,
                placeLogs,
                log.getCreatedAt(),
                log.getUpdatedAt()
        );
    }
}
