package com.example.demo.controller;

import com.example.demo.dto.auth.LoginRequest;
import com.example.demo.dto.auth.LoginResponse;
import com.example.demo.dto.auth.SignUpRequest;
import com.example.demo.dto.auth.UpdateProfileRequest;
import com.example.demo.dto.auth.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@Tag(name = "Auth API", description = "인증 및 회원가입, 프로필 관리 API")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Operation(summary = "회원가입", description = "새로운 사용자를 등록합니다.")
    @PostMapping("/signup")
    public ResponseEntity<Void> signUp(@Valid @RequestBody SignUpRequest request) {
        // Mock Implementation
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다.")
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        // Mock Data
        UserResponse mockUser = new UserResponse(
                1L, "user@coursekok.com", "여행러버", "USER",
                "https://cdn.coursekok.com/profiles/user1.jpg",
                LocalDateTime.now().minusDays(10), LocalDateTime.now()
        );

        LoginResponse mockResponse = new LoginResponse(
                "mock-access-token-12345",
                "mock-refresh-token-67890",
                "Bearer",
                3600L,
                mockUser
        );

        return ResponseEntity.ok(mockResponse);
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "내 프로필 조회", description = "현재 로그인한 사용자의 프로필 정보를 조회합니다.")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile() {
        // Mock Data
        UserResponse mockUser = new UserResponse(
                1L, "user@coursekok.com", "여행러버", "USER",
                "https://cdn.coursekok.com/profiles/user1.jpg",
                LocalDateTime.now().minusDays(10), LocalDateTime.now()
        );
        return ResponseEntity.ok(mockUser);
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "내 프로필 수정", description = "현재 로그인한 사용자의 프로필(닉네임, 이미지 등)을 수정합니다.")
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        // Mock Data
        UserResponse updatedUser = new UserResponse(
                1L, "user@coursekok.com", request.nickname(), "USER",
                request.profileImage(),
                LocalDateTime.now().minusDays(10), LocalDateTime.now()
        );
        return ResponseEntity.ok(updatedUser);
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "로그아웃", description = "현재 발급된 토큰을 무효화(블랙리스트) 처리합니다.")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // Mock Implementation
        return ResponseEntity.ok().build();
    }
}
