package com.example.demo.dto.savedplace;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "장소 찜 등록 요청 DTO")
public record SavedPlaceRequest(

        @Schema(description = "찜할 장소의 내부 ID", example = "1001", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull
        Long placeId
) {}
