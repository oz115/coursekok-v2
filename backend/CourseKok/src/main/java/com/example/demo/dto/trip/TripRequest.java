package com.example.demo.dto.trip;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Schema(description = "여행 일정 생성/수정 요청 DTO")
public record TripRequest(

        @Schema(description = "여행 제목", example = "제주도 힐링 여행", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank
        String title,

        @Schema(description = "여행 시작일", example = "2025-07-01", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull
        LocalDate startDate,

        @Schema(description = "여행 종료일", example = "2025-07-03", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull
        LocalDate endDate,

        @Schema(description = "여행 스타일 태그", example = "힐링,맛집탐방")
        String travelStyle,

        @Schema(description = "주 이동 수단", example = "렌터카")
        String transportation,

        @Schema(description = "공개 여부 (true: 전체공개, false: 나만보기)", example = "false")
        Boolean isPublic
) {}
