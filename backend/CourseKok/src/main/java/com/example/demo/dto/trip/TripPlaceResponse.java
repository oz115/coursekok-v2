package com.example.demo.dto.trip;

import com.example.demo.dto.place.PlaceSummaryResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalTime;

@Schema(description = "세부 여정 장소 응답 DTO")
public record TripPlaceResponse(

        @Schema(description = "세부 여정 고유 ID", example = "3001")
        Long id,

        @Schema(description = "방문할 장소 정보")
        PlaceSummaryResponse place,

        @Schema(description = "방문 순서", example = "1")
        Integer visitOrder,

        @Schema(description = "메모", example = "점심 식사 후 방문")
        String memo,

        @Schema(description = "예정 방문 시작 시간", example = "10:00:00")
        LocalTime startTime,

        @Schema(description = "예정 방문 종료 시간", example = "12:00:00")
        LocalTime endTime
) {}
