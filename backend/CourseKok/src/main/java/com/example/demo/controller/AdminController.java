package com.example.demo.controller;

import com.example.demo.dto.admin.NoticeRequest;
import com.example.demo.dto.admin.NoticeResponse;
import com.example.demo.dto.auth.UserResponse;
import com.example.demo.dto.common.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Tag(name = "Admin / Notice API", description = "시스템 관리 및 공지사항 API")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Operation(summary = "공지사항 목록 조회", description = "시스템 공지사항 목록을 조회합니다. (전체 사용자 가능)")
    @GetMapping("/notices")
    public ResponseEntity<PageResponse<NoticeResponse>> getNotices(
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지당 개수", example = "10") @RequestParam(defaultValue = "10") int size
    ) {
        // Mock Data
        UserResponse adminUser = new UserResponse(
                999L, "admin@coursekok.com", "시스템관리자", "ADMIN", null, LocalDateTime.now().minusYears(1), LocalDateTime.now()
        );

        NoticeResponse mockNotice = new NoticeResponse(
                1L, adminUser, "[공지] 시스템 점검 안내", "<h3>점검 안내</h3><p>새벽 2시부터 서버 점검이 있습니다.</p>",
                LocalDateTime.now().minusDays(1), LocalDateTime.now().minusDays(1)
        );

        PageResponse<NoticeResponse> mockResponse = new PageResponse<>(
                List.of(mockNotice), page, size, 1L, 1, true
        );
        return ResponseEntity.ok(mockResponse);
    }

    @Operation(summary = "공지사항 상세 조회", description = "공지사항 1건의 내용을 상세하게 조회합니다.")
    @GetMapping("/notices/{id}")
    public ResponseEntity<NoticeResponse> getNoticeDetail(
            @Parameter(description = "공지사항 고유 ID", example = "1") @PathVariable Long id
    ) {
        // Mock Data
        UserResponse adminUser = new UserResponse(
                999L, "admin@coursekok.com", "시스템관리자", "ADMIN", null, LocalDateTime.now().minusYears(1), LocalDateTime.now()
        );

        NoticeResponse mockNotice = new NoticeResponse(
                id, adminUser, "[공지] 시스템 점검 안내", "<h3>점검 안내</h3><p>새벽 2시부터 서버 점검이 있습니다.</p>",
                LocalDateTime.now().minusDays(1), LocalDateTime.now().minusDays(1)
        );

        return ResponseEntity.ok(mockNotice);
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "공지사항 등록 (관리자 전용)", description = "시스템 관리자(ADMIN)가 새로운 공지사항을 등록합니다.")
    @PostMapping("/notices")
    public ResponseEntity<NoticeResponse> createNotice(@Valid @RequestBody NoticeRequest request) {
        // Mock Data
        UserResponse adminUser = new UserResponse(
                999L, "admin@coursekok.com", "시스템관리자", "ADMIN", null, LocalDateTime.now().minusYears(1), LocalDateTime.now()
        );

        NoticeResponse mockNotice = new NoticeResponse(
                2L, adminUser, request.title(), request.content(),
                LocalDateTime.now(), LocalDateTime.now()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(mockNotice);
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "공지사항 수정 (관리자 전용)", description = "시스템 관리자(ADMIN)가 기존 공지사항을 수정합니다.")
    @PutMapping("/notices/{id}")
    public ResponseEntity<NoticeResponse> updateNotice(
            @Parameter(description = "공지사항 고유 ID", example = "1") @PathVariable Long id,
            @Valid @RequestBody NoticeRequest request
    ) {
        // Mock Data
        UserResponse adminUser = new UserResponse(
                999L, "admin@coursekok.com", "시스템관리자", "ADMIN", null, LocalDateTime.now().minusYears(1), LocalDateTime.now()
        );

        NoticeResponse mockNotice = new NoticeResponse(
                id, adminUser, request.title(), request.content(),
                LocalDateTime.now().minusDays(1), LocalDateTime.now()
        );

        return ResponseEntity.ok(mockNotice);
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "공지사항 삭제 (관리자 전용)", description = "시스템 관리자(ADMIN)가 공지사항을 삭제합니다.")
    @DeleteMapping("/notices/{id}")
    public ResponseEntity<Void> deleteNotice(
            @Parameter(description = "공지사항 고유 ID", example = "1") @PathVariable Long id
    ) {
        return ResponseEntity.noContent().build();
    }
}
