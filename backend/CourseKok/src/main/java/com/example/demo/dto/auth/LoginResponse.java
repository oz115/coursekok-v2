package com.example.demo.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "로그인 성공 응답 DTO (JWT 토큰 포함)")
public record LoginResponse(

        @Schema(description = "JWT 액세스 토큰", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        String accessToken,

        @Schema(description = "JWT 리프레시 토큰", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        String refreshToken,

        @Schema(description = "토큰 타입", example = "Bearer")
        String tokenType,

        @Schema(description = "액세스 토큰 만료 시간(초)", example = "3600")
        Long expiresIn,

        @Schema(description = "로그인 유저 정보")
        UserResponse user
) {}
