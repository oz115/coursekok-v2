package com.example.demo.dto.lounge;

import com.example.demo.entity.LoungeSpot;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "라운지 스팟 카드 응답 DTO")
public record LoungeSpotSummaryResponse(
        Long id,
        Long placeId,
        String placeTitle,
        String placeAddress,
        String placeImage,
        String badge,
        String curatorNote,
        int displayOrder,
        int reviewCount,
        double averageRating,
        LocalDateTime createdAt
) {
    public static LoungeSpotSummaryResponse from(LoungeSpot spot) {
        return new LoungeSpotSummaryResponse(
                spot.getId(),
                spot.getPlace().getId(),
                spot.getPlace().getTitle(),
                spot.getPlace().getAddress(),
                spot.getPlace().getFirstImage(),
                spot.getBadge().name(),
                spot.getCuratorNote(),
                spot.getDisplayOrder(),
                spot.getReviewCount(),
                spot.getAverageRating(),
                spot.getCreatedAt()
        );
    }
}
