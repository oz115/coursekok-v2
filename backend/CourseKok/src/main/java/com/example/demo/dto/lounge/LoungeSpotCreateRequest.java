package com.example.demo.dto.lounge;

import com.example.demo.entity.LoungeSpot;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

@Schema(description = "라운지 스팟 생성/수정 요청 DTO (관리자 전용)")
public record LoungeSpotCreateRequest(

        @NotNull(message = "장소 ID는 필수입니다.")
        @Schema(description = "추가할 장소 ID (places 테이블 기준)")
        Long placeId,

        @NotNull(message = "배지 종류는 필수입니다.")
        @Schema(description = "배지: POPULAR(인기), RECOMMENDED(추천), SEASONAL(계절)", example = "RECOMMENDED")
        LoungeSpot.Badge badge,

        @Schema(description = "큐레이터 한마디 (선택)")
        String curatorNote,

        @PositiveOrZero
        @Schema(description = "노출 순서 (낮을수록 상단)", example = "0")
        int displayOrder,

        @Schema(description = "활성화 여부", example = "true")
        boolean isActive
) {}
