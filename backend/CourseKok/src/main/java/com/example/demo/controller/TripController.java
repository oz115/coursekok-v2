package com.example.demo.controller;

import com.example.demo.dto.trip.TripDetailResponse;
import com.example.demo.dto.trip.TripSaveRequest;
import com.example.demo.dto.trip.TripSummaryResponse;
import com.example.demo.service.TripService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Trip API", description = "내 여행 저장·조회·삭제")
@RestController
@RequestMapping("/api/trips")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @Operation(summary = "내 여행 목록 조회")
    @GetMapping
    public ResponseEntity<List<TripSummaryResponse>> getMyTrips() {
        return ResponseEntity.ok(tripService.getMyTrips());
    }

    @Operation(summary = "AI 플랜 저장")
    @PostMapping
    public ResponseEntity<TripDetailResponse> saveTrip(@Valid @RequestBody TripSaveRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tripService.saveTrip(req));
    }

    @Operation(summary = "여행 상세 조회 (aiPlanSnapshot 포함)")
    @GetMapping("/{tripId}")
    public ResponseEntity<TripDetailResponse> getTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(tripService.getTrip(tripId));
    }

    @Operation(summary = "여행 삭제")
    @DeleteMapping("/{tripId}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long tripId) {
        tripService.deleteTrip(tripId);
        return ResponseEntity.noContent().build();
    }
}
