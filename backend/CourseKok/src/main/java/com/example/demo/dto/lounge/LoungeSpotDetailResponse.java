package com.example.demo.dto.lounge;

import com.example.demo.dto.common.PageResponse;
import com.example.demo.entity.LoungeSpot;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "라운지 스팟 상세 응답 DTO")
public record LoungeSpotDetailResponse(
        Long id,
        Long placeId,
        String placeTitle,
        String placeAddress,
        String placeImage,
        String placeOverview,
        String placeTel,
        double placeMapX,
        double placeMapY,
        String badge,
        String curatorNote,
        int displayOrder,
        int reviewCount,
        double averageRating,
        boolean myReviewExists,
        PageResponse<LoungeReviewResponse> reviews,
        LocalDateTime createdAt
) {
    public static LoungeSpotDetailResponse from(
            LoungeSpot spot,
            boolean myReviewExists,
            PageResponse<LoungeReviewResponse> reviews
    ) {
        return new LoungeSpotDetailResponse(
                spot.getId(),
                spot.getPlace().getId(),
                spot.getPlace().getTitle(),
                spot.getPlace().getAddress(),
                spot.getPlace().getFirstImage(),
                spot.getPlace().getOverview(),
                spot.getPlace().getTel(),
                spot.getPlace().getMapX() != null ? spot.getPlace().getMapX().doubleValue() : 0.0,
                spot.getPlace().getMapY() != null ? spot.getPlace().getMapY().doubleValue() : 0.0,
                spot.getBadge().name(),
                spot.getCuratorNote(),
                spot.getDisplayOrder(),
                spot.getReviewCount(),
                spot.getAverageRating(),
                myReviewExists,
                reviews,
                spot.getCreatedAt()
        );
    }
}
