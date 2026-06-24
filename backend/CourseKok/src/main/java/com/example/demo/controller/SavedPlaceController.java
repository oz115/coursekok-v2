package com.example.demo.controller;

import com.example.demo.dto.common.PageResponse;
import com.example.demo.dto.place.PlaceSummaryResponse;
import com.example.demo.dto.savedplace.SavedPlaceRequest;
import com.example.demo.dto.savedplace.SavedPlaceResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Tag(name = "Saved Place API", description = "내 보관함(찜한 장소) 관리 API")
@RestController
@RequestMapping("/api/saved-places")
@SecurityRequirement(name = "bearerAuth")
public class SavedPlaceController {

    @Operation(summary = "장소 찜하기", description = "특정 장소를 내 보관함에 추가합니다.")
    @PostMapping
    public ResponseEntity<SavedPlaceResponse> addSavedPlace(@Valid @RequestBody SavedPlaceRequest request) {
        // Mock Data
        PlaceSummaryResponse mockPlace = new PlaceSummaryResponse(
                request.placeId(), 12, "경복궁", "서울특별시 종로구 사직로 161",
                "서울특별시", "종로구",
                new BigDecimal("126.9769930"), new BigDecimal("37.5796212"),
                "https://cdn.visitkorea.or.kr/img/gyeongbokgung.jpg",
                "https://cdn.visitkorea.or.kr/img/gyeongbokgung_thumb.jpg",
                100, 4.5
        );

        SavedPlaceResponse mockResponse = new SavedPlaceResponse(
                501L, mockPlace, LocalDateTime.now()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(mockResponse);
    }

    @Operation(summary = "찜한 장소 목록 조회", description = "내가 찜한 장소 목록을 최신순으로 조회합니다.")
    @GetMapping
    public ResponseEntity<PageResponse<SavedPlaceResponse>> getSavedPlaces(
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지당 개수", example = "20") @RequestParam(defaultValue = "20") int size
    ) {
        // Mock Data
        PlaceSummaryResponse mockPlace = new PlaceSummaryResponse(
                1001L, 12, "경복궁", "서울특별시 종로구 사직로 161",
                "서울특별시", "종로구",
                new BigDecimal("126.9769930"), new BigDecimal("37.5796212"),
                "https://cdn.visitkorea.or.kr/img/gyeongbokgung.jpg",
                "https://cdn.visitkorea.or.kr/img/gyeongbokgung_thumb.jpg",
                100, 4.5
        );

        SavedPlaceResponse mockSavedPlace = new SavedPlaceResponse(
                501L, mockPlace, LocalDateTime.now().minusDays(1)
        );

        PageResponse<SavedPlaceResponse> mockResponse = new PageResponse<>(
                List.of(mockSavedPlace),
                page, size, 1L, 1, true
        );

        return ResponseEntity.ok(mockResponse);
    }

    @Operation(summary = "장소 찜 취소", description = "보관함에서 특정 장소를 제거합니다.")
    @DeleteMapping("/{placeId}")
    public ResponseEntity<Void> removeSavedPlace(
            @Parameter(description = "삭제할 대상 장소의 마스터 ID", example = "1001") @PathVariable Long placeId
    ) {
        // Mock Implementation
        return ResponseEntity.noContent().build();
    }
}
