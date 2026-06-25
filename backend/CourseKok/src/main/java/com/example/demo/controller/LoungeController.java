package com.example.demo.controller;

import com.example.demo.dto.common.PageResponse;
import com.example.demo.dto.lounge.*;
import com.example.demo.service.LoungeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Lounge API", description = "라운지 - 관리자 추천 여행지 및 유저 리뷰")
@RestController
@RequestMapping("/api/lounge")
@RequiredArgsConstructor
public class LoungeController {

    private final LoungeService loungeService;

    // ── 스팟 목록 (공개) ──────────────────────────────────────────────────
    @Operation(summary = "라운지 스팟 목록 조회")
    @GetMapping
    public ResponseEntity<PageResponse<LoungeSpotSummaryResponse>> getSpots(
            @Parameter(description = "배지 필터: POPULAR, RECOMMENDED, SEASONAL (없으면 전체)")
            @RequestParam(required = false) String badge,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(loungeService.getSpots(badge, page, size));
    }

    // ── 스팟 상세 (공개) ──────────────────────────────────────────────────
    @Operation(summary = "라운지 스팟 상세 조회 (리뷰 포함)")
    @GetMapping("/{id}")
    public ResponseEntity<LoungeSpotDetailResponse> getSpotDetail(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int reviewPage,
            @RequestParam(defaultValue = "10") int reviewSize
    ) {
        return ResponseEntity.ok(loungeService.getSpotDetail(id, reviewPage, reviewSize));
    }

    // ── 관리자: 스팟 추가 ─────────────────────────────────────────────────
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "라운지 스팟 추가 (관리자 전용)")
    @PostMapping
    public ResponseEntity<LoungeSpotSummaryResponse> createSpot(
            @Valid @RequestBody LoungeSpotCreateRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(loungeService.createSpot(req));
    }

    // ── 관리자: 스팟 수정 ─────────────────────────────────────────────────
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "라운지 스팟 수정 (관리자 전용)")
    @PutMapping("/{id}")
    public ResponseEntity<LoungeSpotSummaryResponse> updateSpot(
            @PathVariable Long id,
            @Valid @RequestBody LoungeSpotCreateRequest req
    ) {
        return ResponseEntity.ok(loungeService.updateSpot(id, req));
    }

    // ── 관리자: 스팟 삭제 ─────────────────────────────────────────────────
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "라운지 스팟 삭제 (관리자 전용)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSpot(@PathVariable Long id) {
        loungeService.deleteSpot(id);
        return ResponseEntity.noContent().build();
    }

    // ── 리뷰 목록 (공개) ──────────────────────────────────────────────────
    @Operation(summary = "스팟 리뷰 목록 조회")
    @GetMapping("/{id}/reviews")
    public ResponseEntity<PageResponse<LoungeReviewResponse>> getReviews(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(loungeService.getReviews(id, page, size));
    }

    // ── 리뷰 작성 ─────────────────────────────────────────────────────────
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "스팟 리뷰 작성 (1인 1리뷰)")
    @PostMapping("/{id}/reviews")
    public ResponseEntity<LoungeReviewResponse> createReview(
            @PathVariable Long id,
            @Valid @RequestBody LoungeReviewRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(loungeService.createReview(id, req));
    }

    // ── 리뷰 수정 ─────────────────────────────────────────────────────────
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "스팟 리뷰 수정 (본인만)")
    @PutMapping("/{id}/reviews/{reviewId}")
    public ResponseEntity<LoungeReviewResponse> updateReview(
            @PathVariable Long id,
            @PathVariable Long reviewId,
            @Valid @RequestBody LoungeReviewRequest req
    ) {
        return ResponseEntity.ok(loungeService.updateReview(id, reviewId, req));
    }

    // ── 리뷰 삭제 ─────────────────────────────────────────────────────────
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "스팟 리뷰 삭제 (본인 또는 관리자)")
    @DeleteMapping("/{id}/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            @PathVariable Long reviewId
    ) {
        loungeService.deleteReview(id, reviewId);
        return ResponseEntity.noContent().build();
    }
}
