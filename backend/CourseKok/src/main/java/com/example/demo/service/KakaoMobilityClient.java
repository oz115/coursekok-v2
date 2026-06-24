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

    @Value("${kakaomobility.rest-api-key:ef0c06bb5c4aeb23cbd825e750e83e6a}")
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
            log.warn("[KakaoMobility] API 호출 거부: 좌표 인자 중 null이 존재합니다.");
            return Map.of("success", false);
        }

        // 0.0, 0.0 또는 이에 상응하는 유효하지 않은 좌표 차단
        if (originX.compareTo(BigDecimal.ZERO) == 0 || originY.compareTo(BigDecimal.ZERO) == 0 ||
            destX.compareTo(BigDecimal.ZERO) == 0 || destY.compareTo(BigDecimal.ZERO) == 0) {
            log.warn("[KakaoMobility] API 호출 거부: 유효하지 않은 좌표(0.0)가 입력되었습니다. Origin({}, {}), Dest({}, {})",
                    originX.toPlainString(), originY.toPlainString(), destX.toPlainString(), destY.toPlainString());
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
            log.info("[KakaoMobility] === Directions API 요청 시작 ===");
            log.info("[KakaoMobility] -> URL      : {}", uri);
            log.info("[KakaoMobility] -> Origin   : ({}, {})", originX.toPlainString(), originY.toPlainString());
            log.info("[KakaoMobility] -> Dest     : ({}, {})", destX.toPlainString(), destY.toPlainString());
            log.info("[KakaoMobility] -> API Key  : {}***", restApiKey.length() > 6 ? restApiKey.substring(0, 6) : "(short)");

            ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
            log.info("[KakaoMobility] === Directions API 응답 수신 ===");
            log.info("[KakaoMobility] <- HTTP Status: {}", response.getStatusCode());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("[KakaoMobility] <- 응답 Body (앞 400자): {}",
                        response.getBody().length() > 400
                                ? response.getBody().substring(0, 400) + "..."
                                : response.getBody());

                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode routes = root.path("routes");
                if (routes.isArray() && routes.size() > 0) {
                    JsonNode route = routes.get(0);
                    int resultCode = route.path("result_code").asInt(-1);
                    String resultMsg = route.path("result_msg").asText("");
                    log.info("[KakaoMobility] result_code={}, result_msg={}", resultCode, resultMsg);

                    if (resultCode == 0) {
                        JsonNode summary = route.path("summary");
                        int distance = summary.path("distance").asInt(0);
                        int duration = summary.path("duration").asInt(0);
                        JsonNode fare = summary.path("fare");
                        int taxi = fare.path("taxi").asInt(0);
                        int toll = fare.path("toll").asInt(0);

                        log.info("[KakaoMobility] 결과: 거리={}m, 시간={}s({}min), 택시요금={}원, 통행요금={}원",
                                distance, duration, Math.round(duration / 60.0), taxi, toll);

                        java.util.List<Double> vertexesList = new java.util.ArrayList<>();
                        JsonNode sections = route.path("sections");
                        if (sections.isArray()) {
                            for (JsonNode section : sections) {
                                JsonNode roads = section.path("roads");
                                if (roads.isArray()) {
                                    for (JsonNode road : roads) {
                                        JsonNode vertexes = road.path("vertexes");
                                        if (vertexes.isArray() && vertexes.size() >= 2) {
                                            // 인접 road 간 중복 끝점/시작점 제거:
                                            // 이미 마지막 좌표가 있고 현재 road의 첫 좌표와 동일하면 첫 2개(lng,lat) skip
                                            int startIdx = 0;
                                            if (!vertexesList.isEmpty()) {
                                                double lastLng = vertexesList.get(vertexesList.size() - 2);
                                                double lastLat = vertexesList.get(vertexesList.size() - 1);
                                                double firstLng = vertexes.get(0).asDouble();
                                                double firstLat = vertexes.get(1).asDouble();
                                                if (Math.abs(lastLng - firstLng) < 0.000001 &&
                                                    Math.abs(lastLat - firstLat) < 0.000001) {
                                                    startIdx = 2; // 중복 첫 점 skip
                                                }
                                            }
                                            for (int k = startIdx; k < vertexes.size(); k++) {
                                                vertexesList.add(vertexes.get(k).asDouble());
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        log.info("[KakaoMobility] 추출된 경로 꼭짓점 수: {}", vertexesList.size() / 2);

                        return Map.of(
                                "success", true,
                                "distance", distance,
                                "duration", duration,
                                "taxi_fare", taxi,
                                "toll_fare", toll,
                                "vertexes", vertexesList
                        );
                    } else {
                        log.warn("[KakaoMobility] API 응답 에러: code={}, message={}", resultCode, resultMsg);
                    }
                }
            }
        } catch (Exception e) {
            log.error("[KakaoMobility] API 호출 실패: origin={}, destination={}, error={}",
                    origin, destination, e.getMessage(), e);
        }

        log.warn("[KakaoMobility] 경로 조회 실패 또는 하위 응답 없음. success=false 반환.");
        return Map.of("success", false);
    }
}
