package com.example.demo.dto.common;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "공통 페이지네이션 응답 DTO")
public record PageResponse<T>(

        @Schema(description = "현재 페이지의 데이터 목록")
        List<T> content,

        @Schema(description = "현재 페이지 번호 (0부터 시작)", example = "0")
        int pageNumber,

        @Schema(description = "페이지당 항목 수", example = "20")
        int pageSize,

        @Schema(description = "전체 데이터 개수", example = "100")
        long totalElements,

        @Schema(description = "전체 페이지 수", example = "5")
        int totalPages,

        @Schema(description = "마지막 페이지 여부", example = "false")
        boolean isLast
) {}
