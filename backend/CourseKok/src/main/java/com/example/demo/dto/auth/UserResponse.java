package com.example.demo.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "유저 정보 응답 DTO")
public record UserResponse(

        @Schema(description = "유저 고유 ID", example = "1")
        Long id,

        @Schema(description = "이메일 계정", example = "user@coursekok.com")
        String email,

        @Schema(description = "닉네임", example = "여행러버")
        String nickname,

        @Schema(description = "권한 등급", example = "USER", allowableValues = {"USER", "ADMIN"})
        String role,

        @Schema(description = "프로필 이미지 URL", example = "https://cdn.coursekok.com/profiles/user1.jpg")
        String profileImage,

        @Schema(description = "가입 일시", example = "2025-01-15T09:30:00")
        LocalDateTime createdAt,

        @Schema(description = "정보 수정 일시", example = "2025-06-10T14:20:00")
        LocalDateTime updatedAt
) {}
