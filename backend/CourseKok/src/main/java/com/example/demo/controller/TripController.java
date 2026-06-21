package com.example.demo.controller;

import com.example.demo.dto.common.PageResponse;
import com.example.demo.dto.trip.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Tag(name = "Trip Plan API", description = "여행 일정(플래너) 생성 및 관리 API")
@RestController
@RequestMapping("/api/trips")
@SecurityRequirement(name = "bearerAuth")
public class TripController {

    @Operation(summary = "내 여행 일정 목록 조회", description = "내가 생성한 여행 일정 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<PageResponse<TripSummaryResponse>> getMyTrips(
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지당 개수", example = "10") @RequestParam(defaultValue = "10") int size
    ) {
        // Mock Data
        TripSummaryResponse mockTrip = new TripSummaryResponse(
                201L, "제주도 힐링 여행", LocalDate.of(2025, 7, 1), LocalDate.of(2025, 7, 3),
                "힐링,맛집탐방", "렌터카", false, LocalDateTime.now().minusDays(5)
        );

        PageResponse<TripSummaryResponse> mockResponse = new PageResponse<>(
                List.of(mockTrip), page, size, 1L, 1, true
        );
        return ResponseEntity.ok(mockResponse);
    }

    @Operation(summary = "새 여행 일정 생성", description = "기본적인 여행 정보(제목, 기간 등)를 입력하여 플랜 마스터를 생성합니다.")
    @PostMapping
    public ResponseEntity<TripDetailResponse> createTrip(@Valid @RequestBody TripRequest request) {
        // Mock Data
        TripDetailResponse mockDetail = new TripDetailResponse(
                202L, 1L, request.title(), request.startDate(), request.endDate(),
                request.travelStyle(), request.transportation(), request.isPublic(),
                Collections.emptyList(), LocalDateTime.now(), LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(mockDetail);
    }

    @Operation(summary = "여행 일정 상세 조회", description = "특정 플랜의 일자별 스케줄과 장소 리스트를 모두 포함하여 조회합니다.")
    @GetMapping("/{tripId}")
    public ResponseEntity<TripDetailResponse> getTripDetail(
            @Parameter(description = "여행 플랜 고유 ID", example = "201") @PathVariable Long tripId
    ) {
        // Mock Data
        TripDayResponse mockDay = new TripDayResponse(
                1001L, 1, LocalDate.of(2025, 7, 1), Collections.emptyList()
        );

        TripDetailResponse mockDetail = new TripDetailResponse(
                tripId, 1L, "제주도 힐링 여행", LocalDate.of(2025, 7, 1), LocalDate.of(2025, 7, 3),
                "힐링,맛집탐방", "렌터카", false,
                List.of(mockDay), LocalDateTime.now().minusDays(5), LocalDateTime.now()
        );
        return ResponseEntity.ok(mockDetail);
    }

    @Operation(summary = "여행 일정 기본 정보 수정", description = "플랜의 제목, 기간, 공개여부 등을 수정합니다.")
    @PutMapping("/{tripId}")
    public ResponseEntity<TripDetailResponse> updateTrip(
            @Parameter(description = "여행 플랜 고유 ID", example = "201") @PathVariable Long tripId,
            @Valid @RequestBody TripRequest request
    ) {
        // Mock Data
        TripDetailResponse mockDetail = new TripDetailResponse(
                tripId, 1L, request.title(), request.startDate(), request.endDate(),
                request.travelStyle(), request.transportation(), request.isPublic(),
                Collections.emptyList(), LocalDateTime.now().minusDays(5), LocalDateTime.now()
        );
        return ResponseEntity.ok(mockDetail);
    }

    @Operation(summary = "여행 일정 삭제", description = "플랜 마스터와 하위의 모든 세부 여정을 삭제합니다.")
    @DeleteMapping("/{tripId}")
    public ResponseEntity<Void> deleteTrip(
            @Parameter(description = "여행 플랜 고유 ID", example = "201") @PathVariable Long tripId
    ) {
        return ResponseEntity.noContent().build();
    }

    // --- 일자별 세부 여정 장소 관리 (Trip Places) ---

    @Operation(summary = "특정 일자에 장소 추가", description = "n일차 스케줄에 새로운 방문 장소를 추가합니다.")
    @PostMapping("/{tripId}/days/{dayId}/places")
    public ResponseEntity<TripDayResponse> addPlaceToDay(
            @Parameter(description = "여행 플랜 고유 ID", example = "201") @PathVariable Long tripId,
            @Parameter(description = "일자(Day) 고유 ID", example = "1001") @PathVariable Long dayId,
            @Valid @RequestBody TripPlaceRequest request
    ) {
        // Mock Data
        TripDayResponse mockDay = new TripDayResponse(
                dayId, 1, LocalDate.of(2025, 7, 1), Collections.emptyList()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(mockDay);
    }

    @Operation(summary = "특정 방문 장소 정보 수정", description = "순서, 시간, 메모 등을 변경합니다.")
    @PutMapping("/{tripId}/places/{tripPlaceId}")
    public ResponseEntity<TripPlaceResponse> updateTripPlace(
            @Parameter(description = "여행 플랜 고유 ID", example = "201") @PathVariable Long tripId,
            @Parameter(description = "세부 여정 고유 ID", example = "3001") @PathVariable Long tripPlaceId,
            @Valid @RequestBody TripPlaceRequest request
    ) {
        // Mock Data (단일 Response 반환)
        TripPlaceResponse mockPlaceResponse = new TripPlaceResponse(
                tripPlaceId, null, request.visitOrder(), request.memo(), request.startTime(), request.endTime()
        );
        return ResponseEntity.ok(mockPlaceResponse);
    }

    @Operation(summary = "특정 방문 장소 삭제", description = "일정 내에서 특정 장소 방문 계획을 취소합니다.")
    @DeleteMapping("/{tripId}/places/{tripPlaceId}")
    public ResponseEntity<Void> deleteTripPlace(
            @Parameter(description = "여행 플랜 고유 ID", example = "201") @PathVariable Long tripId,
            @Parameter(description = "세부 여정 고유 ID", example = "3001") @PathVariable Long tripPlaceId
    ) {
        return ResponseEntity.noContent().build();
    }
}
