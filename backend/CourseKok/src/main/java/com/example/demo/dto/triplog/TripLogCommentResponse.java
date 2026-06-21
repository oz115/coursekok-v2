package com.example.demo.dto.triplog;

import com.example.demo.dto.auth.UserResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "여행기 댓글 응답 DTO")
public record TripLogCommentResponse(

        @Schema(description = "댓글 고유 ID", example = "5001")
        Long id,

        @Schema(description = "댓글 작성자 정보")
        UserResponse author,

        @Schema(description = "댓글 본문 내용", example = "너무 좋은 코스네요! 스크랩해갑니다.")
        String content,

        @Schema(description = "댓글 작성 일시", example = "2025-08-01T12:00:00")
        LocalDateTime createdAt,

        @Schema(description = "댓글 수정 일시", example = "2025-08-01T12:00:00")
        LocalDateTime updatedAt
) {}
