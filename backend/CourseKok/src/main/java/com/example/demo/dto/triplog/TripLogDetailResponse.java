package com.example.demo.dto.triplog;

import com.example.demo.dto.auth.UserResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "여행기 피드 상세 응답 DTO")
public record TripLogDetailResponse(

        @Schema(description = "여행기 고유 ID", example = "501")
        Long id,

        @Schema(description = "작성자 정보")
        UserResponse author,

        @Schema(description = "원본 여행 일정 ID (존재 시)", example = "201")
        Long tripId,

        @Schema(description = "여행기 메인 제목", example = "제주도 3박 4일 완벽 가이드")
        String title,

        @Schema(description = "여행기 전체를 아우르는 에필로그/서문", example = "정말 즐거웠던 제주도 여행...")
        String content,

        @Schema(description = "주요 지역명", example = "제주도")
        String region,

        @Schema(description = "여행 스타일 태그", example = "힐링,가족여행")
        String travelStyle,

        @Schema(description = "피드 메인 노출 공개 여부", example = "true")
        Boolean isPublic,

        @Schema(description = "총 조회수", example = "150")
        Integer viewCount,

        @Schema(description = "좋아요 총합", example = "42")
        Integer likeCount,

        @Schema(description = "스크랩 횟수", example = "10")
        Integer copyCount,

        @Schema(description = "장소별 포토 리뷰 스냅샷 목록")
        List<TripPlaceLogResponse> placeLogs,

        @Schema(description = "최초 발행 일시", example = "2025-08-01T10:00:00")
        LocalDateTime createdAt,

        @Schema(description = "최종 수정 일시", example = "2025-08-02T15:30:00")
        LocalDateTime updatedAt
) {}
