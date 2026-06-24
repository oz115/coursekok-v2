package com.example.demo.controller;

import com.example.demo.dto.common.PageResponse;
import com.example.demo.dto.triplog.*;
import com.example.demo.service.TripLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "TripLog API", description = "여행기 커뮤니티 피드·댓글·좋아요·북마크")
@RestController
@RequestMapping("/api/trip-logs")
@RequiredArgsConstructor
public class TripLogController {

    private final TripLogService tripLogService;

    // ── 공개 피드 ──────────────────────────────────────────────────────────
    @Operation(summary = "공개 여행기 피드 조회")
    @GetMapping
    public ResponseEntity<PageResponse<TripLogSummaryResponse>> getFeed(
            @Parameter(description = "필터: recent(기본), popular, photo, route") @RequestParam(defaultValue = "recent") String filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(tripLogService.getFeed(filter, page, size));
    }

    // ── 발행 ──────────────────────────────────────────────────────────────
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "여행기 발행")
    @PostMapping
    public ResponseEntity<TripLogDetailResponse> createTripLog(@Valid @RequestBody TripLogCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tripLogService.createTripLog(req));
    }

    // ── 상세 ──────────────────────────────────────────────────────────────
    @Operation(summary = "여행기 상세 조회")
    @GetMapping("/{id}")
    public ResponseEntity<TripLogDetailResponse> getTripLog(@PathVariable Long id) {
        return ResponseEntity.ok(tripLogService.getTripLog(id));
    }

    // ── 수정 ──────────────────────────────────────────────────────────────
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "여행기 수정")
    @PutMapping("/{id}")
    public ResponseEntity<TripLogDetailResponse> updateTripLog(
            @PathVariable Long id,
            @Valid @RequestBody TripLogCreateRequest req
    ) {
        return ResponseEntity.ok(tripLogService.updateTripLog(id, req));
    }

    // ── 삭제 ──────────────────────────────────────────────────────────────
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "여행기 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTripLog(@PathVariable Long id) {
        tripLogService.deleteTripLog(id);
        return ResponseEntity.noContent().build();
    }

    // ── 좋아요 토글 ────────────────────────────────────────────────────────
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "좋아요 ON")
    @PostMapping("/{id}/likes")
    public ResponseEntity<Map<String, Object>> like(@PathVariable Long id) {
        boolean liked = tripLogService.toggleLike(id);
        return ResponseEntity.ok(Map.of("liked", liked));
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "좋아요 OFF")
    @DeleteMapping("/{id}/likes")
    public ResponseEntity<Map<String, Object>> unlike(@PathVariable Long id) {
        boolean liked = tripLogService.toggleLike(id);
        return ResponseEntity.ok(Map.of("liked", liked));
    }

    // ── 북마크 토글 ────────────────────────────────────────────────────────
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "북마크 ON")
    @PostMapping("/{id}/bookmarks")
    public ResponseEntity<Map<String, Object>> bookmark(@PathVariable Long id) {
        boolean bookmarked = tripLogService.toggleBookmark(id);
        return ResponseEntity.ok(Map.of("bookmarked", bookmarked));
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "북마크 OFF")
    @DeleteMapping("/{id}/bookmarks")
    public ResponseEntity<Map<String, Object>> unbookmark(@PathVariable Long id) {
        boolean bookmarked = tripLogService.toggleBookmark(id);
        return ResponseEntity.ok(Map.of("bookmarked", bookmarked));
    }

    // ── 댓글 ──────────────────────────────────────────────────────────────
    @Operation(summary = "댓글 목록")
    @GetMapping("/{id}/comments")
    public ResponseEntity<PageResponse<TripLogCommentResponse>> getComments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(tripLogService.getComments(id, page, size));
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "댓글 작성")
    @PostMapping("/{id}/comments")
    public ResponseEntity<TripLogCommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody TripLogCommentRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tripLogService.addComment(id, req));
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "댓글 삭제")
    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @PathVariable Long commentId
    ) {
        tripLogService.deleteComment(id, commentId);
        return ResponseEntity.noContent().build();
    }
}
