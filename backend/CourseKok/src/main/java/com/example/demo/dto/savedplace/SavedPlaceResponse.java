package com.example.demo.dto.savedplace;

import com.example.demo.dto.place.PlaceSummaryResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "찜한 장소 응답 DTO")
public record SavedPlaceResponse(

        @Schema(description = "찜(북마크) 행위 고유 ID", example = "501")
        Long id,

        @Schema(description = "찜한 장소 정보")
        PlaceSummaryResponse place,

        @Schema(description = "찜한 일시", example = "2025-06-21T15:30:00")
        LocalDateTime createdAt
) {}
