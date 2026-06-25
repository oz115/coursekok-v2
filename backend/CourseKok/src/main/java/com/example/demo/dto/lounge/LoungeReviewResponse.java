package com.example.demo.dto.lounge;

import com.example.demo.entity.LoungeReview;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "라운지 리뷰 응답 DTO")
public record LoungeReviewResponse(
        Long id,
        Long authorId,
        String authorNickname,
        String authorProfileImage,
        int rating,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static LoungeReviewResponse from(LoungeReview review) {
        return new LoungeReviewResponse(
                review.getId(),
                review.getUser().getId(),
                review.getUser().getNickname(),
                review.getUser().getProfileImage(),
                review.getRating(),
                review.getContent(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }
}
