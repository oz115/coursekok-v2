package com.example.demo.dto.triplog;

import com.example.demo.entity.TripLog;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "여행기 피드 카드 응답 DTO")
public record TripLogSummaryResponse(

        Long id,
        String authorNickname,
        String authorProfileImage,
        String title,
        String region,
        String travelStyle,
        String coverImage,
        String mood,
        int likeCount,
        int copyCount,
        int commentCount,
        boolean liked,
        boolean bookmarked,
        boolean isPublic,
        LocalDateTime createdAt
) {
    public static TripLogSummaryResponse from(TripLog log, boolean liked, boolean bookmarked, int commentCount) {
        return new TripLogSummaryResponse(
                log.getId(),
                log.getUser().getNickname(),
                log.getUser().getProfileImage(),
                log.getTitle(),
                log.getRegion(),
                log.getTravelStyle(),
                log.getCoverImage(),
                log.getMood(),
                log.getLikeCount(),
                log.getCopyCount(),
                commentCount,
                liked,
                bookmarked,
                log.isPublic(),
                log.getCreatedAt()
        );
    }
}
