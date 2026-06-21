package com.example.demo.dto.triplog;

import com.example.demo.dto.auth.UserResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "여행기 피드 목록 요약 응답 DTO")
public record TripLogSummaryResponse(

        @Schema(description = "여행기 고유 ID", example = "501")
        Long id,

        @Schema(description = "작성자 정보")
        UserResponse author,

        @Schema(description = "여행기 제목", example = "제주도 3박 4일 완벽 가이드")
        String title,

        @Schema(description = "주요 지역명", example = "제주도")
        String region,

        @Schema(description = "여행 스타일 태그", example = "힐링,가족여행")
        String travelStyle,

        @Schema(description = "총 조회수", example = "150")
        Integer viewCount,

        @Schema(description = "좋아요 총합", example = "42")
        Integer likeCount,

        @Schema(description = "스크랩 횟수", example = "10")
        Integer copyCount,

        @Schema(description = "최초 발행 일시", example = "2025-08-01T10:00:00")
        LocalDateTime createdAt
) {}
