package com.example.demo.dto.place;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "관광지 목록 조회용 요약 응답 DTO (썸네일 최적화)")
public record PlaceSummaryResponse(

        @Schema(description = "장소 내부 ID", example = "1001")
        Long id,

        @Schema(description = "관광타입 ID", example = "12")
        Integer contentTypeId,

        @Schema(description = "관광지 명칭", example = "경복궁")
        String title,

        @Schema(description = "주소", example = "서울특별시 종로구 사직로 161")
        String address,

        @Schema(description = "시도명", example = "서울특별시")
        String ldongRegnNm,

        @Schema(description = "시군구명", example = "종로구")
        String ldongSignguNm,

        @Schema(description = "경도 (Longitude)", example = "126.9769930")
        BigDecimal mapX,

        @Schema(description = "위도 (Latitude)", example = "37.5796212")
        BigDecimal mapY,

        @Schema(description = "썸네일 이미지 URL", example = "https://cdn.visitkorea.or.kr/img/gyeongbokgung_thumb.jpg")
        String firstImage2
) {}
