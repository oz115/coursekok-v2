package com.example.demo.service;

import com.example.demo.dto.tourapi.TourApiResponse;
import com.example.demo.dto.tourapi.TourApiDetailCommonResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URI;

@Service
public class TourApiClient {

    private final WebClient webClient;
    private final String serviceKey;

    public TourApiClient(@Value("${tourapi.service-key:testKey}") String serviceKey) {
        this.serviceKey = serviceKey;

        // 대용량 JSON 응답을 버퍼링할 수 있도록 100MB 버퍼 제한 설정
        this.webClient = WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(100 * 1024 * 1024))
                .build();
    }

    /**
     * 법정동 시도 코드 목록 조회
     */
    public com.example.demo.dto.tourapi.LdongCodeResponse getLdongSidoCode() {
        String urlString = String.format(
                "https://apis.data.go.kr/B551011/KorService2/ldongCode2?serviceKey=%s&numOfRows=1000&pageNo=1&MobileOS=ETC&MobileApp=CourseKok&_type=json&lDongListYn=N",
                serviceKey);
        return webClient.get()
                .uri(URI.create(urlString))
                .retrieve()
                .bodyToMono(com.example.demo.dto.tourapi.LdongCodeResponse.class)
                .block();
    }

    /**
     * 특정 시도 하위의 법정동 시군구 코드 목록 조회
     */
    public com.example.demo.dto.tourapi.LdongCodeResponse getLdongSigunguCode(String sidoCode) {
        String urlString = String.format(
                "https://apis.data.go.kr/B551011/KorService2/ldongCode2?serviceKey=%s&numOfRows=100&pageNo=1&MobileOS=ETC&MobileApp=CourseKok&_type=json&lDongRegnCd=%s&lDongListYn=N",
                serviceKey, sidoCode);
        return webClient.get()
                .uri(URI.create(urlString))
                .retrieve()
                .bodyToMono(com.example.demo.dto.tourapi.LdongCodeResponse.class)
                .block();
    }

    /**
     * 지역기반 관광정보 조회
     *
     * @param numOfRows 한 페이지 결과 수
     * @param pageNo    페이지 번호
     * @return TourApiResponse API 응답 DTO
     */
    public TourApiResponse getAreaBasedList(int numOfRows, int pageNo) {
        return getAreaBasedList(numOfRows, pageNo, null, null);
    }

    /**
     * 법정동 지역기반 관광정보 조회 (시도 / 시군구 필터 지정)
     */
    public TourApiResponse getAreaBasedList(int numOfRows, int pageNo, String lDongRegnCd, String lDongSignguCd) {
        StringBuilder sb = new StringBuilder();
        sb.append("https://apis.data.go.kr/B551011/KorService2/areaBasedList2?");
        sb.append("serviceKey=").append(serviceKey);
        sb.append("&numOfRows=").append(numOfRows);
        sb.append("&pageNo=").append(pageNo);
        sb.append("&MobileOS=ETC&MobileApp=CourseKok&_type=json&arrange=A");
        if (lDongRegnCd != null && !lDongRegnCd.trim().isEmpty()) {
            sb.append("&lDongRegnCd=").append(lDongRegnCd.trim());
        }
        if (lDongSignguCd != null && !lDongSignguCd.trim().isEmpty()) {
            sb.append("&lDongSignguCd=").append(lDongSignguCd.trim());
        }

        return webClient.get()
                .uri(URI.create(sb.toString()))
                .retrieve()
                .bodyToMono(TourApiResponse.class)
                .block(); // 동기적으로 데이터 반환
    }

    /**
     * 콘텐츠 ID로 공통 상세정보(소개, 홈페이지, 전화번호)를 조회합니다.
     */
    public TourApiDetailCommonResponse getDetailCommon(String contentId) {
        String urlString = String.format(
                "https://apis.data.go.kr/B551011/KorService2/detailCommon2"
                        + "?serviceKey=%s&MobileOS=ETC&MobileApp=CourseKok&_type=json&contentId=%s",
                serviceKey,
                contentId
        );

        return webClient.get()
                .uri(URI.create(urlString))
                .retrieve()
                .bodyToMono(TourApiDetailCommonResponse.class)
                .block();
    }
}
