package com.example.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.net.URI;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoMobilityClient {

    @Value("${kakaomobility.rest-api-key:c9d09a25b1be2a50a320be712f5a6b82}")
    private String restApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 출발지와 목적지 좌표를 받아 카카오 Directions API를 호출하여 경로 요약 정보를 조회합니다.
     *
     * @param originX 출발지 경도 (map_x)
     * @param originY 출발지 위도 (map_y)
     * @param destX   목적지 경도 (map_x)
     * @param destY   목적지 위도 (map_y)
     * @return 성공 시 요금, 시간, 거리 정보를 포함한 맵, 실패 시 success=false를 가진 맵
     */
    public Map<String, Object> getDirections(BigDecimal originX, BigDecimal originY, BigDecimal destX, BigDecimal destY) {
        if (originX == null || originY == null || destX == null || destY == null) {
            return Map.of("success", false);
        }

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + restApiKey.trim());
        headers.set("Content-Type", "application/json");

        String origin = String.format("%s,%s", originX.toPlainString(), originY.toPlainString());
        String destination = String.format("%s,%s", destX.toPlainString(), destY.toPlainString());

        URI uri = UriComponentsBuilder.fromUriString("https://apis-navi.kakaomobility.com/v1/directions")
                .queryParam("origin", origin)
                .queryParam("destination", destination)
                .queryParam("priority", "RECOMMEND")
                .build()
                .toUri();

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            log.info("Kakao Mobility API Request: URI={}", uri);
            ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode routes = root.path("routes");
                if (routes.isArray() && routes.size() > 0) {
                    JsonNode route = routes.get(0);
                    int resultCode = route.path("result_code").asInt(-1);
                    if (resultCode == 0) {
                        JsonNode summary = route.path("summary");
                        int distance = summary.path("distance").asInt(0);
                        int duration = summary.path("duration").asInt(0);
                        
                        JsonNode fare = summary.path("fare");
                        int taxi = fare.path("taxi").asInt(0);
                        int toll = fare.path("toll").asInt(0);

                        return Map.of(
                                "success", true,
                                "distance", distance,
                                "duration", duration,
                                "taxi_fare", taxi,
                                "toll_fare", toll
                        );
                    } else {
                        String resultMsg = route.path("result_msg").asText("");
                        log.warn("Kakao Mobility API 응답 에러: code={}, message={}", resultCode, resultMsg);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Kakao Mobility API 호출 실패: origin={}, destination={}", origin, destination, e);
        }

        return Map.of("success", false);
    }
}
