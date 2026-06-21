package com.example.demo.dto.trip;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "여행 일정 요약 응답 DTO")
public record TripSummaryResponse(

        @Schema(description = "여행 플랜 고유 ID", example = "201")
        Long id,

        @Schema(description = "여행 제목", example = "제주도 힐링 여행")
        String title,

        @Schema(description = "여행 시작일", example = "2025-07-01")
        LocalDate startDate,

        @Schema(description = "여행 종료일", example = "2025-07-03")
        LocalDate endDate,

        @Schema(description = "여행 스타일 태그", example = "힐링,맛집탐방")
        String travelStyle,

        @Schema(description = "주 이동 수단", example = "렌터카")
        String transportation,

        @Schema(description = "공개 여부", example = "false")
        Boolean isPublic,

        @Schema(description = "생성 일시", example = "2025-06-21T10:00:00")
        LocalDateTime createdAt
) {}
