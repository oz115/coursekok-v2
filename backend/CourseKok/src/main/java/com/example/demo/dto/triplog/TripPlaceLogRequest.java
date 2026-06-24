package com.example.demo.dto.triplog;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "장소별 포토 리뷰 작성 요청")
public record TripPlaceLogRequest(

        @Schema(description = "장소 이름 스냅샷", example = "성산일출봉")
        String placeTitle,

        @Schema(description = "장소 카테고리 스냅샷", example = "관광지")
        String placeCategory,

        @Schema(description = "장소 이미지 URL 스냅샷")
        String placeImage,

        @Schema(description = "방문 순서", example = "1")
        int visitOrder,

        @Schema(description = "몇 일차", example = "1")
        int dayNumber,

        @Schema(description = "장소 후기 텍스트")
        String reviewContent,

        @Schema(description = "이미지 URL (쉼표 구분 또는 Data URL 배열을 JSON으로 직렬화)")
        String imageUrl,

        @Schema(description = "만족도 평점 (1~5)", example = "4.5")
        Double rating
) {}
