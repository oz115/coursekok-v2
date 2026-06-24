package com.example.demo.dto.place;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "관광지 정보 응답 DTO")
public record PlaceResponse(

        @Schema(description = "장소 내부 ID", example = "1001")
        Long id,

        @Schema(description = "TourAPI 외부 content_id", example = "126508")
        String contentId,

        @Schema(description = "관광타입 ID (12:관광지, 14:문화시설, 15:축제, 25:여행코스, 28:레포츠, 32:숙박, 38:쇼핑, 39:음식점)", example = "12")
        Integer contentTypeId,

        @Schema(description = "관광지 명칭", example = "경복궁")
        String title,

        @Schema(description = "주소", example = "서울특별시 종로구 사직로 161")
        String address,

        @Schema(description = "시도 코드", example = "11")
        String ldongRegnCd,

        @Schema(description = "시군구 코드", example = "110")
        String ldongSignguCd,

        @Schema(description = "시도명", example = "서울특별시")
        String ldongRegnNm,

        @Schema(description = "시군구명", example = "종로구")
        String ldongSignguNm,

        @Schema(description = "분류체계 대분류 코드", example = "A01")
        String lclsSystm1,

        @Schema(description = "분류체계 중분류 코드", example = "A0101")
        String lclsSystm2,

        @Schema(description = "분류체계 소분류 코드", example = "A01010100")
        String lclsSystm3,

        @Schema(description = "경도 (Longitude)", example = "126.9769930")
        BigDecimal mapX,

        @Schema(description = "위도 (Latitude)", example = "37.5796212")
        BigDecimal mapY,

        @Schema(description = "대표 이미지 URL", example = "https://cdn.visitkorea.or.kr/img/gyeongbokgung.jpg")
        String firstImage,

        @Schema(description = "썸네일 이미지 URL", example = "https://cdn.visitkorea.or.kr/img/gyeongbokgung_thumb.jpg")
        String firstImage2,

        @Schema(description = "저작권 유형", example = "Type1")
        String cpyrhtDivCd,

        @Schema(description = "전화번호", example = "02-3700-3900")
        String tel,

        @Schema(description = "공식 홈페이지 URL", example = "http://www.royalpalace.go.kr")
        String homepage,

        @Schema(description = "상세 소개 텍스트", example = "조선왕조 제일의 법궁으로 1395년 태조 이성계가 창건하였다...")
        String overview,

        @Schema(description = "조회수", example = "1050")
        Integer views,

        @Schema(description = "평점", example = "4.2")
        Double rating,

        @Schema(description = "데이터 수집 일시", example = "2025-01-10T08:00:00")
        LocalDateTime createdAt,

        @Schema(description = "데이터 갱신 일시", example = "2025-06-01T12:00:00")
        LocalDateTime updatedAt
) {}
