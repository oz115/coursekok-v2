package com.example.demo.controller;

import com.example.demo.dto.common.PageResponse;
import com.example.demo.dto.place.PlaceResponse;
import com.example.demo.dto.place.PlaceSummaryResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Tag(name = "Place API", description = "관광지(장소) 탐색 및 조회 API")
@RestController
@RequestMapping("/api/places")
public class PlaceController {

    @Operation(summary = "관광지 목록/검색 조회", description = "키워드, 지역, 카테고리 등의 필터 조건으로 관광지 목록을 페이지네이션하여 조회합니다.")
    @GetMapping
    public ResponseEntity<PageResponse<PlaceSummaryResponse>> getPlaces(
            @Parameter(description = "검색 키워드 (장소명, 주소)") @RequestParam(required = false) String keyword,
            @Parameter(description = "시도 코드") @RequestParam(required = false) String ldongRegnCd,
            @Parameter(description = "시군구 코드") @RequestParam(required = false) String ldongSignguCd,
            @Parameter(description = "관광타입 ID") @RequestParam(required = false) Integer contentTypeId,
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지당 개수", example = "20") @RequestParam(defaultValue = "20") int size
    ) {
        // Mock Data
        PlaceSummaryResponse mockPlace = new PlaceSummaryResponse(
                1001L, 12, "경복궁", "서울특별시 종로구 사직로 161",
                "서울특별시", "종로구",
                new BigDecimal("126.9769930"), new BigDecimal("37.5796212"),
                "https://cdn.visitkorea.or.kr/img/gyeongbokgung_thumb.jpg"
        );

        PageResponse<PlaceSummaryResponse> mockResponse = new PageResponse<>(
                List.of(mockPlace, mockPlace),
                page, size, 150L, 8, false
        );

        return ResponseEntity.ok(mockResponse);
    }

    @Operation(summary = "관광지 상세 조회", description = "특정 관광지의 상세 정보(개요, 전화번호, 홈페이지 등)를 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<PlaceResponse> getPlaceDetail(
            @Parameter(description = "장소 내부 고유 ID", example = "1001") @PathVariable Long id
    ) {
        // Mock Data
        PlaceResponse mockDetail = new PlaceResponse(
                id, "126508", 12, "경복궁", "서울특별시 종로구 사직로 161",
                "11", "110", "서울특별시", "종로구",
                "A01", "A0101", "A01010100",
                new BigDecimal("126.9769930"), new BigDecimal("37.5796212"),
                "https://cdn.visitkorea.or.kr/img/gyeongbokgung.jpg",
                "https://cdn.visitkorea.or.kr/img/gyeongbokgung_thumb.jpg",
                "Type1", "02-3700-3900", "http://www.royalpalace.go.kr",
                "조선왕조 제일의 법궁으로 1395년 태조 이성계가 창건하였다...",
                LocalDateTime.now().minusYears(1), LocalDateTime.now()
        );

        return ResponseEntity.ok(mockDetail);
    }
}
