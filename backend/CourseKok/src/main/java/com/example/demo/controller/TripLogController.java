package com.example.demo.controller;

import com.example.demo.dto.auth.UserResponse;
import com.example.demo.dto.common.PageResponse;
import com.example.demo.dto.triplog.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Tag(name = "Trip Log API", description = "여행기(매거진) 및 커뮤니티(댓글, 좋아요, 북마크) API")
@RestController
@RequestMapping("/api/trip-logs")
public class TripLogController {

    @Operation(summary = "전체 여행기 피드 목록 조회", description = "공개된 최신 여행기 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<PageResponse<TripLogSummaryResponse>> getTripLogs(
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지당 개수", example = "10") @RequestParam(defaultValue = "10") int size
    ) {
        // Mock Data
        UserResponse author = new UserResponse(
                1L, "user@coursekok.com", "여행러버", "USER", null, LocalDateTime.now(), LocalDateTime.now()
        );

        TripLogSummaryResponse mockLog = new TripLogSummaryResponse(
                501L, author, "제주도 3박 4일 완벽 가이드", "제주도", "힐링,가족여행",
                150, 42, 10, LocalDateTime.now().minusDays(2)
        );

        PageResponse<TripLogSummaryResponse> mockResponse = new PageResponse<>(
                List.of(mockLog), page, size, 100L, 10, false
        );

        return ResponseEntity.ok(mockResponse);
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "내 여행기 발행", description = "기존 플랜을 바탕으로 하거나 완전히 새로운 여행기를 커뮤니티에 작성/발행합니다.")
    @PostMapping
    public ResponseEntity<TripLogDetailResponse> createTripLog(@Valid @RequestBody TripLogRequest request) {
        // Mock Data
        UserResponse author = new UserResponse(
                1L, "user@coursekok.com", "여행러버", "USER", null, LocalDateTime.now(), LocalDateTime.now()
        );

        TripLogDetailResponse mockDetail = new TripLogDetailResponse(
                502L, author, request.tripId(), request.title(), request.content(),
                request.region(), request.travelStyle(), request.isPublic(),
                0, 0, 0, Collections.emptyList(), LocalDateTime.now(), LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(mockDetail);
    }

    @Operation(summary = "여행기 상세 조회", description = "여행기 본문과 장소별 포토 리뷰를 조회하며, 조회수가 1 증가합니다.")
    @GetMapping("/{tripLogId}")
    public ResponseEntity<TripLogDetailResponse> getTripLogDetail(
            @Parameter(description = "여행기 고유 ID", example = "501") @PathVariable Long tripLogId
    ) {
        // Mock Data
        UserResponse author = new UserResponse(
                1L, "user@coursekok.com", "여행러버", "USER", null, LocalDateTime.now(), LocalDateTime.now()
        );

        TripLogDetailResponse mockDetail = new TripLogDetailResponse(
                tripLogId, author, 201L, "제주도 3박 4일 완벽 가이드", "정말 즐거웠던 제주도 여행...",
                "제주도", "힐링,가족여행", true,
                151, 42, 10, Collections.emptyList(), LocalDateTime.now().minusDays(2), LocalDateTime.now().minusDays(2)
        );
        return ResponseEntity.ok(mockDetail);
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "여행기 수정", description = "내가 작성한 여행기를 수정합니다.")
    @PutMapping("/{tripLogId}")
    public ResponseEntity<TripLogDetailResponse> updateTripLog(
            @Parameter(description = "여행기 고유 ID", example = "501") @PathVariable Long tripLogId,
            @Valid @RequestBody TripLogRequest request
    ) {
        // Mock Data
        UserResponse author = new UserResponse(
                1L, "user@coursekok.com", "여행러버", "USER", null, LocalDateTime.now(), LocalDateTime.now()
        );

        TripLogDetailResponse mockDetail = new TripLogDetailResponse(
                tripLogId, author, request.tripId(), request.title(), request.content(),
                request.region(), request.travelStyle(), request.isPublic(),
                151, 42, 10, Collections.emptyList(), LocalDateTime.now().minusDays(2), LocalDateTime.now()
        );
        return ResponseEntity.ok(mockDetail);
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "여행기 삭제", description = "내가 작성한 여행기를 삭제합니다.")
    @DeleteMapping("/{tripLogId}")
    public ResponseEntity<Void> deleteTripLog(
            @Parameter(description = "여행기 고유 ID", example = "501") @PathVariable Long tripLogId
    ) {
        return ResponseEntity.noContent().build();
    }

    // --- 좋아요 (Likes) ---

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "여행기 좋아요", description = "게시글에 좋아요를 누릅니다.")
    @PostMapping("/{tripLogId}/likes")
    public ResponseEntity<Void> likeTripLog(
            @Parameter(description = "여행기 고유 ID", example = "501") @PathVariable Long tripLogId
    ) {
        return ResponseEntity.ok().build();
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "여행기 좋아요 취소", description = "게시글 좋아요를 취소합니다.")
    @DeleteMapping("/{tripLogId}/likes")
    public ResponseEntity<Void> unlikeTripLog(
            @Parameter(description = "여행기 고유 ID", example = "501") @PathVariable Long tripLogId
    ) {
        return ResponseEntity.noContent().build();
    }

    // --- 북마크/스크랩 (Bookmarks) ---

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "여행기 북마크", description = "타인의 여행기를 내 보관함에 스크랩합니다.")
    @PostMapping("/{tripLogId}/bookmarks")
    public ResponseEntity<Void> bookmarkTripLog(
            @Parameter(description = "여행기 고유 ID", example = "501") @PathVariable Long tripLogId
    ) {
        return ResponseEntity.ok().build();
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "여행기 북마크 취소", description = "보관함에서 스크랩한 여행기를 제거합니다.")
    @DeleteMapping("/{tripLogId}/bookmarks")
    public ResponseEntity<Void> unbookmarkTripLog(
            @Parameter(description = "여행기 고유 ID", example = "501") @PathVariable Long tripLogId
    ) {
        return ResponseEntity.noContent().build();
    }

    // --- 댓글 (Comments) ---

    @Operation(summary = "여행기 댓글 목록 조회", description = "특정 여행기에 달린 댓글 목록을 조회합니다.")
    @GetMapping("/{tripLogId}/comments")
    public ResponseEntity<PageResponse<TripLogCommentResponse>> getComments(
            @Parameter(description = "여행기 고유 ID", example = "501") @PathVariable Long tripLogId,
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지당 개수", example = "20") @RequestParam(defaultValue = "20") int size
    ) {
        // Mock Data
        UserResponse author = new UserResponse(
                2L, "guest@coursekok.com", "지나가던나그네", "USER", null, LocalDateTime.now(), LocalDateTime.now()
        );

        TripLogCommentResponse mockComment = new TripLogCommentResponse(
                5001L, author, "너무 멋진 코스네요!", LocalDateTime.now(), LocalDateTime.now()
        );

        PageResponse<TripLogCommentResponse> mockResponse = new PageResponse<>(
                List.of(mockComment), page, size, 1L, 1, true
        );
        return ResponseEntity.ok(mockResponse);
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "여행기 댓글 작성", description = "게시글에 피드백 댓글을 등록합니다.")
    @PostMapping("/{tripLogId}/comments")
    public ResponseEntity<TripLogCommentResponse> addComment(
            @Parameter(description = "여행기 고유 ID", example = "501") @PathVariable Long tripLogId,
            @Valid @RequestBody TripLogCommentRequest request
    ) {
        // Mock Data
        UserResponse author = new UserResponse(
                1L, "user@coursekok.com", "여행러버", "USER", null, LocalDateTime.now(), LocalDateTime.now()
        );

        TripLogCommentResponse mockComment = new TripLogCommentResponse(
                5002L, author, request.content(), LocalDateTime.now(), LocalDateTime.now()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(mockComment);
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "여행기 댓글 삭제", description = "내가 작성한 댓글을 삭제합니다.")
    @DeleteMapping("/{tripLogId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @Parameter(description = "여행기 고유 ID", example = "501") @PathVariable Long tripLogId,
            @Parameter(description = "댓글 고유 ID", example = "5001") @PathVariable Long commentId
    ) {
        return ResponseEntity.noContent().build();
    }
}
