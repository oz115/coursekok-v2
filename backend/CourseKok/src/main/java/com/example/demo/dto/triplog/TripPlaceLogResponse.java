package com.example.demo.dto.triplog;

import com.example.demo.dto.place.PlaceSummaryResponse;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "장소별 포토 리뷰 스냅샷 응답 DTO")
public record TripPlaceLogResponse(

        @Schema(description = "포토 리뷰 고유 ID", example = "10001")
        Long id,

        @Schema(description = "원본 장소 정보 (스냅샷 당시 연결된 장소 정보)")
        PlaceSummaryResponse place,

        @Schema(description = "당시 방문 순서", example = "1")
        Integer visitOrder,

        @Schema(description = "당시 방문 일차", example = "1")
        Integer dayNumber,

        @Schema(description = "상세 후기 텍스트", example = "경치가 너무 아름다웠습니다.")
        String reviewContent,

        @Schema(description = "이미지 URL 목록 (쉼표 구분)", example = "https://cdn.coursekok.com/img1.jpg,https://cdn.coursekok.com/img2.jpg")
        String imageUrl
) {}
