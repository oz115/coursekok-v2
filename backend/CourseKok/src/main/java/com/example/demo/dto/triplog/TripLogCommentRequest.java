package com.example.demo.dto.triplog;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "여행기 댓글 작성 요청 DTO")
public record TripLogCommentRequest(

        @Schema(description = "댓글 본문", example = "정말 멋진 여행이네요!", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank
        @Size(max = 500)
        String content
) {}
