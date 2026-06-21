package com.example.demo.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "회원가입 요청 DTO")
public record SignUpRequest(

        @Schema(description = "로그인용 이메일", example = "user@coursekok.com", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank @Email
        String email,

        @Schema(description = "비밀번호 (8자 이상)", example = "Password123!", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank @Size(min = 8, max = 100)
        String password,

        @Schema(description = "서비스 내 닉네임 (2~20자)", example = "여행러버", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank @Size(min = 2, max = 20)
        String nickname
) {}
