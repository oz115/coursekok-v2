package com.example.demo.dto.admin;

import com.example.demo.dto.auth.UserResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "공지사항 응답 DTO")
public record NoticeResponse(

        @Schema(description = "공지사항 고유 ID", example = "1")
        Long id,

        @Schema(description = "작성 관리자 정보")
        UserResponse admin,

        @Schema(description = "공지 제목", example = "[공지] 시스템 점검 안내")
        String title,

        @Schema(description = "공지 본문 (HTML)", example = "<h3>점검 안내</h3><p>새벽 2시부터...</p>")
        String content,

        @Schema(description = "최초 등록 일시", example = "2025-01-01T10:00:00")
        LocalDateTime createdAt,

        @Schema(description = "최종 수정 일시", example = "2025-01-01T10:00:00")
        LocalDateTime updatedAt
) {}
