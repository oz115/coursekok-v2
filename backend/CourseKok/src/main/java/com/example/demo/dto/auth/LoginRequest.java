package com.example.demo.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "로그인 요청 DTO")
public record LoginRequest(

        @Schema(description = "이메일 계정", example = "user@coursekok.com", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank @Email
        String email,

        @Schema(description = "비밀번호", example = "Password123!", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank
        String password
) {}
