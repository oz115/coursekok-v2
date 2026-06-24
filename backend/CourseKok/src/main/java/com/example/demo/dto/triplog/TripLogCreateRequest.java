package com.example.demo.dto.triplog;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

@Schema(description = "여행기 발행 요청 DTO")
public record TripLogCreateRequest(

        @Schema(description = "연결된 Trip ID (선택)", example = "1")
        Long tripId,

        @Schema(description = "여행기 제목", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank
        String title,

        @Schema(description = "여행기 전체 이야기/서문", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank
        String content,

        @Schema(description = "지역", example = "제주", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank
        String region,

        @Schema(description = "여행 스타일", example = "힐링")
        String travelStyle,

        @Schema(description = "공개 여부", example = "true")
        Boolean isPublic,

        @Schema(description = "대표 커버 이미지 URL")
        String coverImage,

        @Schema(description = "여행 기분", example = "행복했어요")
        String mood,

        @Schema(description = "장소별 포토 리뷰 목록")
        List<TripPlaceLogRequest> placeLogs
) {}
