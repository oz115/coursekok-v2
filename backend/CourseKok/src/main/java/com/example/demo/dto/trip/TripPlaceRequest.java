package com.example.demo.dto.trip;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

@Schema(description = "세부 여정 장소 추가/수정 요청 DTO")
public record TripPlaceRequest(

        @Schema(description = "관광지 마스터 ID", example = "1001", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull
        Long placeId,

        @Schema(description = "방문 순서", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull
        Integer visitOrder,

        @Schema(description = "메모", example = "점심 식사 후 방문")
        String memo,

        @Schema(description = "예정 방문 시작 시간", example = "10:00:00")
        LocalTime startTime,

        @Schema(description = "예정 방문 종료 시간", example = "12:00:00")
        LocalTime endTime
) {}
