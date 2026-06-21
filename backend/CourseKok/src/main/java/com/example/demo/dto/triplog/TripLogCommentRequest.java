package com.example.demo.dto.triplog;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "여행기 댓글 작성/수정 요청 DTO")
public record TripLogCommentRequest(

        @Schema(description = "댓글 본문 내용", example = "너무 좋은 코스네요! 스크랩해갑니다.", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank
        String content
) {}
