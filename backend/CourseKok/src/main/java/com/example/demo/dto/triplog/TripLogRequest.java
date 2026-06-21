package com.example.demo.dto.triplog;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@Schema(description = "여행기 게시글 생성/수정 요청 DTO")
public record TripLogRequest(

        @Schema(description = "기반이 된 여행 플랜 ID (선택사항)", example = "201")
        Long tripId,

        @Schema(description = "여행기 메인 제목", example = "제주도 3박 4일 완벽 가이드", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank
        String title,

        @Schema(description = "여행기 전체를 아우르는 에필로그/서문", example = "정말 즐거웠던 제주도 여행...", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank
        String content,

        @Schema(description = "검색 및 필터링용 대상 주요 지역명", example = "제주도", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank
        String region,

        @Schema(description = "여행 스타일 태그", example = "힐링,가족여행")
        String travelStyle,

        @Schema(description = "피드 메인 노출 공개 여부", example = "true")
        Boolean isPublic,

        @Schema(description = "장소별 포토 리뷰 목록")
        List<TripPlaceLogRequest> placeLogs
) {}
