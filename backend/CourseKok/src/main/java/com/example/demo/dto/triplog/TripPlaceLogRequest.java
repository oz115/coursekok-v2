package com.example.demo.dto.triplog;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "여행지별 포토 리뷰 스냅샷 요청 DTO")
public record TripPlaceLogRequest(

        @Schema(description = "대상이 되는 원본 장소 ID", example = "1001", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull
        Long placeId,

        @Schema(description = "기록 작성 시점의 방문 순서", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull
        Integer visitOrder,

        @Schema(description = "기록 작성 시점의 방문 일차", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull
        Integer dayNumber,

        @Schema(description = "장소에 특화된 사용자 상세 후기", example = "경치가 너무 아름다웠습니다.")
        String reviewContent,

        @Schema(description = "쉼표(,) 구분자 다중 이미지 URL", example = "https://cdn.coursekok.com/img1.jpg,https://cdn.coursekok.com/img2.jpg")
        String imageUrl
) {}
