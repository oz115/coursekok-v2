package com.example.demo.service;

import com.example.demo.dto.tourapi.TourApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class TourApiClientTest {

    @Autowired
    private TourApiClient tourApiClient;

    @Test
    void getAreaBasedList_printsJsonToConsole() {
        try {
            // API 요청 (예: 10개, 1페이지)
            TourApiResponse response = tourApiClient.getAreaBasedList(10, 1);

            // 결과 검증 (응답 객체가 null이 아님을 검증)
            assertThat(response).isNotNull();
            
            // JSON으로 보기 좋게 콘솔에 출력
            ObjectMapper objectMapper = new ObjectMapper();
            String prettyJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(response);
            System.out.println("========== TourAPI Response ==========");
            System.out.println(prettyJson);
            System.out.println("======================================");
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            System.err.println("========== TourAPI API Error ==========");
            System.err.println("상태 코드: " + e.getStatusCode());
            System.err.println("응답 본문(에러 메시지): " + e.getResponseBodyAsString());
            System.err.println("이 메시지를 통해 서비스 키 문제인지 파라미터 문제인지 확인할 수 있습니다.");
            System.err.println("=======================================");
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("========== TourAPI Error ==========");
            System.err.println("API 통신 또는 DTO 파싱 중 일반 오류가 발생했습니다.");
            System.err.println("원인: " + e.getMessage());
            System.err.println("===================================");
            e.printStackTrace();
        }
    }
}
