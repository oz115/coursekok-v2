package com.example.demo.dto.triplog;

import com.example.demo.entity.TripLog;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "여행기 피드 카드 응답 DTO")
public record TripLogSummaryResponse(

        Long id,
        Long authorId,
        String authorNickname,
        String authorProfileImage,
        String title,
        String region,
        String travelStyle,
        String coverImage,
        String mood,
        List<String> userImages,
        List<String> placeImages,
        int likeCount,
        int copyCount,
        int commentCount,
        boolean liked,
        boolean bookmarked,
        boolean isPublic,
        LocalDateTime createdAt
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
    public static TripLogSummaryResponse from(TripLog log, boolean liked, boolean bookmarked, int commentCount) {
        List<String> userImages = log.getPlaceLogs().stream()
                .map(pl -> pl.getImageUrl())
                .filter(img -> img != null && !img.isBlank())
                .toList();
        List<String> placeImages = log.getPlaceLogs().stream()
                .map(pl -> pl.getPlaceImage())
                .filter(img -> img != null && !img.isBlank())
                .distinct()
                .toList();
        return new TripLogSummaryResponse(
                log.getId(),
                log.getUser().getId(),
                log.getUser().getNickname(),
                log.getUser().getProfileImage(),
                log.getTitle(),
                log.getRegion(),
                publicTravelStyle(log.getTravelStyle()),
                log.getCoverImage(),
                log.getMood(),
                userImages,
                placeImages,
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
