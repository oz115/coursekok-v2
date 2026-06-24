package com.example.demo.controller;

import com.example.demo.dto.common.PageResponse;
import com.example.demo.dto.place.PlaceResponse;
import com.example.demo.dto.place.PlaceSummaryResponse;
import com.example.demo.dto.place.RegionDto;
import com.example.demo.service.PlaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Place API", description = "관광지(장소) 탐색 및 조회 API")
@RestController
@RequestMapping("/api/places")
public class PlaceController {

    private final PlaceService placeService;

    public PlaceController(PlaceService placeService) {
        this.placeService = placeService;
    }

    @Operation(summary = "관광지 목록/검색 조회", description = "키워드, 지역, 카테고리 등의 필터 조건으로 관광지 목록을 페이지네이션하여 조회합니다.")
    @GetMapping
    public ResponseEntity<PageResponse<PlaceSummaryResponse>> getPlaces(
            @Parameter(description = "검색 키워드 (장소명, 주소)") @RequestParam(required = false) String keyword,
            @Parameter(description = "시도 코드") @RequestParam(required = false) String ldongRegnCd,
            @Parameter(description = "시군구 코드") @RequestParam(required = false) String ldongSignguCd,
            @Parameter(description = "관광타입 ID") @RequestParam(required = false) Integer contentTypeId,
            @Parameter(description = "정렬 기준 (views: 추천순/조회수, rating: 평점순)") @RequestParam(defaultValue = "views") String sortBy,
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지당 개수", example = "20") @RequestParam(defaultValue = "20") int size
    ) {
        PageResponse<PlaceSummaryResponse> response = placeService.searchPlaces(
                keyword, ldongRegnCd, ldongSignguCd, contentTypeId, sortBy, page, size
        );
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "관광지 상세 조회", description = "특정 관광지의 상세 정보(개요, 전화번호, 홈페이지 등)를 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<PlaceResponse> getPlaceDetail(
            @Parameter(description = "장소 내부 고유 ID", example = "1001") @PathVariable Long id
    ) {
        PlaceResponse detail = placeService.getPlaceDetail(id);
        return ResponseEntity.ok(detail);
    }

    @Operation(summary = "시도 목록 조회", description = "선택 가능한 시도 목록을 조회합니다.")
    @GetMapping("/regions/sido")
    public ResponseEntity<List<RegionDto>> getSidos() {
        List<RegionDto> sidos = placeService.getSidos();
        return ResponseEntity.ok(sidos);
    }

    @Operation(summary = "시군구 목록 조회", description = "특정 시도 하위의 시군구 목록을 조회합니다.")
    @GetMapping("/regions/sigungu")
    public ResponseEntity<List<RegionDto>> getSigungus(
            @Parameter(description = "시도 코드", example = "11") @RequestParam String sidoCode
    ) {
        List<RegionDto> sigungus = placeService.getSigungus(sidoCode);
        return ResponseEntity.ok(sigungus);
    }
}
