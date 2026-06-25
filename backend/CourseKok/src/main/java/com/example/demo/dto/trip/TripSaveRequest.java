package com.example.demo.dto.trip;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "AI 플랜 저장 요청 DTO")
public record TripSaveRequest(

        @Schema(description = "여행 제목", example = "제주 2박 3일 힐링", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank
        String title,

        @Schema(description = "지역", example = "제주")
        String region,

        @Schema(description = "기간 텍스트", example = "2박 3일")
        String period,

        @Schema(description = "여행 스타일", example = "힐링")
        String style,

        @Schema(description = "커버 이미지 URL 또는 Data URL")
        String coverImage,

        @Schema(description = "여행 시작일", example = "2026-06-25")
        java.time.LocalDate startDate,

        @Schema(description = "여행 종료일", example = "2026-06-27")
        java.time.LocalDate endDate,

        @Schema(description = "AI 생성 일정 전체 JSON 문자열", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank
        String aiPlanSnapshot
) {}
