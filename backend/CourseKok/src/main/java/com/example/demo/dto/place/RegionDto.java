package com.example.demo.dto.place;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "지역 정보 DTO (시도 또는 시군구)")
public record RegionDto(
        @Schema(description = "지역 코드", example = "11")
        String code,
        @Schema(description = "지역 이름", example = "서울특별시")
        String name
) {}
