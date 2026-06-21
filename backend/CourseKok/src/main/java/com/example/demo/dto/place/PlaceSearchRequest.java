package com.example.demo.dto.place;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "관광지 목록 검색 요청 파라미터 DTO")
public record PlaceSearchRequest(

        @Schema(description = "검색 키워드 (장소명 또는 주소)", example = "경복궁")
        String keyword,

        @Schema(description = "시도 코드로 필터링", example = "11")
        String ldongRegnCd,

        @Schema(description = "시군구 코드로 필터링", example = "110")
        String ldongSignguCd,

        @Schema(description = "관광타입 ID로 필터링 (12:관광지, 39:음식점 등)", example = "12")
        Integer contentTypeId,

        @Schema(description = "분류체계 대분류 코드", example = "A01")
        String lclsSystm1,

        @Schema(description = "페이지 번호 (0부터 시작)", example = "0")
        Integer page,

        @Schema(description = "페이지당 항목 수", example = "20")
        Integer size
) {}
