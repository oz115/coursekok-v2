package com.example.demo.dto.triplog;

import com.example.demo.entity.TripLogComment;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "여행기 댓글 응답 DTO")
public record TripLogCommentResponse(

        Long id,
        Long userId,
        String nickname,
        String profileImage,
        String content,
        boolean isMine,
        LocalDateTime createdAt
) {
    public static TripLogCommentResponse from(TripLogComment comment, boolean isMine) {
        return new TripLogCommentResponse(
                comment.getId(),
                comment.getUser().getId(),
                comment.getUser().getNickname(),
                comment.getUser().getProfileImage(),
                comment.getContent(),
                isMine,
                comment.getCreatedAt()
        );
    }
}
