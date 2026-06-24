package com.example.demo.controller;

import com.example.demo.dto.common.PageResponse;
import com.example.demo.dto.savedplace.SavedPlaceRequest;
import com.example.demo.dto.savedplace.SavedPlaceResponse;
import com.example.demo.service.SavedPlaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Saved Place API", description = "내 보관함(찜한 장소) 관리 API")
@RestController
@RequestMapping("/api/saved-places")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class SavedPlaceController {

    private final SavedPlaceService savedPlaceService;

    @Operation(summary = "찜한 장소 목록 조회", description = "내가 찜한 장소 목록을 최신순으로 조회합니다.")
    @GetMapping
    public ResponseEntity<PageResponse<SavedPlaceResponse>> getSavedPlaces(
            @AuthenticationPrincipal String email,
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지당 개수", example = "20") @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<SavedPlaceResponse> result = savedPlaceService.getSavedPlaces(email, pageable);
        
        PageResponse<SavedPlaceResponse> response = new PageResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "장소 찜하기", description = "특정 장소를 내 보관함에 추가합니다.")
    @PostMapping
    public ResponseEntity<SavedPlaceResponse> addSavedPlace(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody SavedPlaceRequest request) {
        
        SavedPlaceResponse response = savedPlaceService.savePlace(email, request.placeId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "장소 찜 취소", description = "보관함에서 특정 장소를 제거합니다.")
    @DeleteMapping
    public ResponseEntity<Void> removeSavedPlace(
            @AuthenticationPrincipal String email,
            @Parameter(description = "삭제할 대상 장소의 마스터 ID", example = "1001") @RequestParam Long placeId) {
        
        savedPlaceService.deletePlace(email, placeId);
        return ResponseEntity.noContent().build();
    }
}
