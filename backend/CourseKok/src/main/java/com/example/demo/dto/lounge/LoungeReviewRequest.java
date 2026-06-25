package com.example.demo.dto.lounge;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "라운지 리뷰 작성/수정 요청 DTO")
public record LoungeReviewRequest(

        @NotNull
        @Min(value = 1, message = "별점은 1 이상이어야 합니다.")
        @Max(value = 5, message = "별점은 5 이하여야 합니다.")
        @Schema(description = "별점 (1~5)", example = "4")
        Integer rating,

        @NotBlank(message = "리뷰 내용은 필수입니다.")
        @Schema(description = "리뷰 내용", example = "경치가 정말 좋았어요!")
        String content
) {}
