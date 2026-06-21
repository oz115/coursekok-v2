package com.example.demo.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "공지사항 생성/수정 요청 DTO (관리자 전용)")
public record NoticeRequest(

        @Schema(description = "공지 제목", example = "[공지] 시스템 점검 안내", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank
        String title,

        @Schema(description = "공지 본문 (HTML 가능)", example = "<h3>점검 안내</h3><p>새벽 2시부터...</p>", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank
        String content
) {}
