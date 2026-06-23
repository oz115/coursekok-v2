package com.example.demo.controller;

import com.example.demo.dto.auth.LoginRequest;
import com.example.demo.dto.auth.LoginResponse;
import com.example.demo.dto.auth.SignUpRequest;
import com.example.demo.dto.auth.UpdateProfileRequest;
import com.example.demo.dto.auth.UserResponse;
import com.example.demo.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Auth API", description = "인증 및 회원가입, 프로필 관리 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "회원가입", description = "새로운 사용자를 등록합니다.")
    @PostMapping("/signup")
    ResponseEntity<Void> signUp(@Valid @RequestBody SignUpRequest request) {
        authService.signUp(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인하여 JWT 액세스 토큰을 발급받습니다. 리프레시 토큰은 httpOnly 쿠키로 설정됩니다.")
    @PostMapping("/login")
    ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request,
                                        HttpServletResponse response) {
        return ResponseEntity.ok(authService.login(request, response));
    }

    @Operation(summary = "토큰 재발급", description = "httpOnly 쿠키의 리프레시 토큰으로 새 액세스 토큰을 발급받습니다.")
    @PostMapping("/refresh")
    ResponseEntity<LoginResponse> refresh(HttpServletRequest request,
                                          HttpServletResponse response) {
        return ResponseEntity.ok(authService.refresh(request, response));
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "내 프로필 조회", description = "현재 로그인한 사용자의 프로필 정보를 조회합니다.")
    @GetMapping("/me")
    ResponseEntity<UserResponse> getMyProfile(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(authService.getProfile(email));
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "내 프로필 수정", description = "현재 로그인한 사용자의 닉네임 및 프로필 이미지를 수정합니다.")
    @PutMapping("/me")
    ResponseEntity<UserResponse> updateMyProfile(@AuthenticationPrincipal String email,
                                                 @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(email, request));
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "로그아웃", description = "리프레시 토큰을 무효화하고 쿠키를 삭제합니다.")
    @PostMapping("/logout")
    ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(request, response);
        return ResponseEntity.ok().build();
    }
}
