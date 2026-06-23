package com.example.demo.service;

import com.example.demo.dto.tourapi.TourApiResponse;
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

        // baseUrl이나 커스텀 UriBuilderFactory 없이 가장 순수한 WebClient 생성
        this.webClient = WebClient.builder().build();
    }

    /**
     * 지역기반 관광정보 조회
     *
     * @param numOfRows 한 페이지 결과 수
     * @param pageNo    페이지 번호
     * @return TourApiResponse API 응답 DTO
     */
    public TourApiResponse getAreaBasedList(int numOfRows, int pageNo) {
        // 공공데이터포털 매뉴얼 기준 정확한 URL (https:// 사용, KorService2/areaBasedList2)
        // WebClient의 쿼리 파라미터 인코딩 개입을 막기 위해 완전히 조립된 문자열을 URI 객체로 만들어 전송합니다.
        String urlString = String.format(
                "https://apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey=%s&numOfRows=%d&pageNo=%d&MobileOS=ETC&MobileApp=CourseKok&_type=json&arrange=A",
                serviceKey, numOfRows, pageNo);

        return webClient.get()
                .uri(URI.create(urlString))
                .retrieve()
                .bodyToMono(TourApiResponse.class)
                .block(); // 동기적으로 데이터 반환
    }
}
