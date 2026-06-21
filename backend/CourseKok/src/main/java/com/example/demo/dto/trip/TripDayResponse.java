package com.example.demo.dto.trip;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.util.List;

@Schema(description = "여행 일자별 그룹 응답 DTO")
public record TripDayResponse(

        @Schema(description = "일자 그룹 고유 ID", example = "1001")
        Long id,

        @Schema(description = "n일차", example = "1")
        Integer dayNumber,

        @Schema(description = "실제 날짜", example = "2025-07-01")
        LocalDate tripDate,

        @Schema(description = "해당 일자의 세부 방문 장소 목록")
        List<TripPlaceResponse> tripPlaces
) {}
