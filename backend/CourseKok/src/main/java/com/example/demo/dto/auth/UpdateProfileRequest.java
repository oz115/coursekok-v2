package com.example.demo.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

@Schema(description = "내 프로필 수정 요청 DTO")
public record UpdateProfileRequest(

        @Schema(description = "변경할 닉네임 (2~20자)", example = "새로운닉네임")
        @Size(min = 2, max = 20)
        String nickname,

        @Schema(description = "프로필 이미지 URL (S3 Object URL)", example = "https://cdn.coursekok.com/profiles/new.jpg")
        String profileImage
) {}
