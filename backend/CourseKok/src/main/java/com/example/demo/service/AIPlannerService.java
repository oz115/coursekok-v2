package com.example.demo.service;

import com.example.demo.dto.aiplanner.AIPlannerRequestDto;
import com.example.demo.entity.Place;
import com.example.demo.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIPlannerService {

    private final PlaceRepository placeRepository;
    private final KakaoMobilityClient kakaoMobilityClient;

    @Value("${gms.api.url}")
    private String gmsApiUrl;

    @Value("${gms.api.key}")
    private String gmsApiKey;

    @SuppressWarnings("unchecked")
    public String generateTravelCourse(AIPlannerRequestDto requestDto) {
        // 1. 바구니 장소 상세 조회
        List<Place> savedPlaces = placeRepository.findAllById(requestDto.getSavedPlaceIds());
        
        String placesInfo = savedPlaces.stream()
                .map(p -> String.format("- ID: %d, 이름: %s (주소: %s, 위도: %s, 경도: %s)", 
                        p.getId(), p.getTitle(), p.getAddress(), p.getMapY(), p.getMapX()))
                .collect(Collectors.joining("\n"));

        // 1-2. 바구니 장소와 동일한 지역의 인기 관광지 및 숙소 후보 조회
        String candidatePlacesInfo = "";
        String candidateAccommodationsInfo = "";
        if (!savedPlaces.isEmpty()) {
            String targetLdongRegnCd = savedPlaces.get(0).getRegionCode().getLdongRegnCd();
            if (targetLdongRegnCd != null) {
                // 숙박시설(32)을 제외한 상위 인기 관광지 30개
                List<Place> popularPlaces = placeRepository.findTopPopularPlacesInRegionExcludeContentType(
                        targetLdongRegnCd, 32, org.springframework.data.domain.PageRequest.of(0, 30));
                
                // 숙박시설(32)만 포함하는 상위 인기 숙소 20개
                List<Place> popularAccommodations = placeRepository.findTopPopularPlacesInRegionByContentType(
                        targetLdongRegnCd, 32, org.springframework.data.domain.PageRequest.of(0, 20));
                
                Set<Long> savedIds = savedPlaces.stream().map(Place::getId).collect(Collectors.toSet());
                
                candidatePlacesInfo = popularPlaces.stream()
                        .filter(p -> !savedIds.contains(p.getId()))
                        .map(p -> String.format("- ID: %d, 이름: %s (주소: %s, 위도: %s, 경도: %s)", 
                                p.getId(), p.getTitle(), p.getAddress(), p.getMapY(), p.getMapX()))
                        .collect(Collectors.joining("\n"));

                candidateAccommodationsInfo = popularAccommodations.stream()
                        .filter(p -> !savedIds.contains(p.getId()))
                        .map(p -> String.format("- ID: %d, 이름: %s (주소: %s, 위도: %s, 경도: %s)", 
                                p.getId(), p.getTitle(), p.getAddress(), p.getMapY(), p.getMapX()))
                        .collect(Collectors.joining("\n"));
            }
        }

        // 2. 프롬프트 작성
        String prompt = String.format(
                "너는 대한민국 최고의 여행 가이드 AI야. 아래 조건들과 장소들을 기반으로 최적의 여행 일정을 구성해줘.\n\n" +
                "[여행 조건]\n" +
                "- 여행 시작일: %s\n" +
                "- 여행 종료일: %s\n" +
                "- 인원수: %d명\n" +
                "- 여행 스타일: %s\n" +
                "- 주 이동 수단: %s\n" +
                "- 추가 요청사항: %s\n\n" +
                "[바구니 장소 리스트 (반드시 동선에 최대한 포함시킬 것)]\n" +
                "%s\n\n" +
                "[추가 추천 후보 장소 리스트 (필요 시 코스 보완 및 동선 연결을 위해 아래 장소 중에서 선택하여 구성할 것)]\n" +
                "%s\n\n" +
                "[추가 추천 후보 숙소 리스트 (숙박 일정이 필요한 경우 아래 제공된 숙소 리스트 중에서만 선택하여 구성할 것)]\n" +
                "%s\n\n" +
                "[요구사항]\n" +
                "- 제공된 '바구니 장소 리스트'를 일자별 동선에 맞추어 최대한 골고루 배정하고, 부족한 공간이나 동선 연결이 필요할 경우 '추가 추천 후보 장소 리스트'에 있는 장소들을 적극 선택해 여행 동선(하루 약 3~4개 장소 권장)을 알차게 채워줘.\n" +
                "- 사용자가 선택한 [주 이동 수단]을 기반으로 장소 간 이동 경로와 예상 교통비(유류비, 택시비, 지하철 요금 등)를 계산하여 각 장소 정보의 transport 객체에 넣어줘. (각 일자의 첫 번째 방문 장소는 출발점이므로 transport를 생략하거나 포함하지 말 것)\n" +
                "- 일정에 숙소(숙박)가 포함될 경우, 반드시 제공된 '추가 추천 후보 숙소 리스트'에서만 선택해야 하고 임의로 숙소를 지어내선 안 돼. 하루의 동선 마지막에 가장 적합한 숙소를 accommodation 필드에 지정해줘.\n" +
                "- 일정에 들어가는 모든 장소의 이름, 위도(map_y), 경도(map_x)는 제공된 리스트에 있는 정보를 100%% 정확하게 사용해야 해. 또한 제공된 ID 정보(place_id)도 응답 JSON의 place_id 필드에 정확히 일치시켜 줘. 절대 값을 임의로 가공하거나 지어내지 마!\n" +
                "- 결과물은 프론트엔드에서 파싱하기 쉽도록 반드시 아래 JSON 포맷으로만 응답해야 해. 설명이나 마크다운 백틱(```) 등 일체의 텍스트는 제외하고 순수한 JSON 데이터만 반환해줘.\n\n" +
                "[JSON 포맷 스키마 예시]\n" +
                "{\n" +
                "  \"day_plans\": [\n" +
                "    {\n" +
                "      \"day_number\": 1,\n" +
                "      \"places\": [\n" +
                "        {\n" +
                "          \"visit_order\": 1,\n" +
                "          \"place_id\": 105,\n" +
                "          \"title\": \"강남역 맛집\",\n" +
                "          \"map_x\": 127.0276,\n" +
                "          \"map_y\": 37.4979\n" +
                "        },\n" +
                "        {\n" +
                "          \"visit_order\": 2,\n" +
                "          \"place_id\": 204,\n" +
                "          \"title\": \"코엑스 아쿠아리움\",\n" +
                "          \"map_x\": 127.0590,\n" +
                "          \"map_y\": 37.5125,\n" +
                "          \"transport\": {\n" +
                "            \"type\": \"대중교통\",\n" +
                "            \"route_descrption\": \"지하철 2호선 강남역 -> 삼성역 이동 (약 15분)\",\n" +
                "            \"estimated_cost\": 1400\n" +
                "          }\n" +
                "        }\n" +
                "      ],\n" +
                "      \"accommodation\": {\n" +
                "        \"place_id\": 999,\n" +
                "        \"title\": \"삼성동 신라스테이 (추천 숙소)\",\n" +
                "        \"map_x\": 127.0625,\n" +
                "        \"map_y\": 37.5098,\n" +
                "        \"reason\": \"1일차 마지막 목적지인 코엑스에서 도보 5분 거리로 이동이 가장 편리합니다.\"\n" +
                "      }\n" +
                "    }\n" +
                "  ]\n" +
                "}",
                requestDto.getStartDate(),
                requestDto.getEndDate(),
                requestDto.getHeadcount(),
                String.join(", ", requestDto.getTravelStyles()),
                requestDto.getTransportation() != null ? requestDto.getTransportation() : "자차",
                requestDto.getAdditionalRequests() != null ? requestDto.getAdditionalRequests() : "없음",
                placesInfo.isEmpty() ? "(바구니에 담은 장소가 없습니다.)" : placesInfo,
                candidatePlacesInfo.isEmpty() ? "(후보 장소가 없습니다.)" : candidatePlacesInfo,
                candidateAccommodationsInfo.isEmpty() ? "(후보 숙소가 없습니다.)" : candidateAccommodationsInfo,
                requestDto.getTransportation() != null ? requestDto.getTransportation() : "자차"
        );

        // 3. Anthropic Claude API (via GMS) 호출
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", gmsApiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "claude-opus-4-8");
        requestBody.put("max_tokens", 2048);

        Map<String, String> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        requestBody.put("messages", List.of(message));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        // ── 요청 로깅 ──────────────────────────────────────────
        log.info("[AI-Planner] === GMS/Claude API 요청 시작 ===");
        log.info("[AI-Planner] URL     : {}", gmsApiUrl);
        log.info("[AI-Planner] Model   : claude-opus-4-8  |  max_tokens: 2048");
        log.info("[AI-Planner] 바구니 장소 수: {}개", savedPlaces.size());
        log.info("[AI-Planner] Prompt (축약, 500자):\n{}",
                prompt.length() > 500 ? prompt.substring(0, 500) + "..." : prompt);
        // ───────────────────────────────────────────────────────

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(gmsApiUrl, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            // ── 응답 로깅 ─────────────────────────────────────
            log.info("[AI-Planner] === GMS/Claude API 응답 수신 ===");
            log.info("[AI-Planner] HTTP Status: {}", response.getStatusCode());
            if (responseBody != null) {
                log.info("[AI-Planner] 응답 키 목록: {}", responseBody.keySet());
            }
            // ──────────────────────────────────────────────────

            if (responseBody != null && responseBody.containsKey("content")) {
                List<Map<String, Object>> contentList = (List<Map<String, Object>>) responseBody.get("content");
                if (contentList != null && !contentList.isEmpty()) {
                    String rawText = (String) contentList.get(0).get("text");
                    log.info("[AI-Planner] AI 응답 원문 (앞 800자):\n{}",
                            rawText != null && rawText.length() > 800
                                    ? rawText.substring(0, 800) + "..." : rawText);
                    String extractedJson = extractJson(rawText);
                    return postProcessWithKakaoDirections(extractedJson, requestDto.getTransportation());
                }
            }
            return "[]";
        } catch (Exception e) {
            log.error("[AI-Planner] GMS/Claude API 호출 실패: {}", e.getMessage(), e);
            return "[]";
        }
    }

    private String extractJson(String text) {
        if (text == null) return "[]";
        text = text.trim();
        if (text.startsWith("```json")) {
            text = text.substring(7);
        } else if (text.startsWith("```")) {
            text = text.substring(3);
        }
        if (text.endsWith("```")) {
            text = text.substring(0, text.length() - 3);
        }
        return text.trim();
    }

    private String postProcessWithKakaoDirections(String rawJson, String transportation) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(rawJson);
            JsonNode dayPlans = rootNode.path("day_plans");
            
            if (dayPlans.isArray()) {
                for (JsonNode dayPlan : dayPlans) {
                    JsonNode places = dayPlan.path("places");
                    // 1. 관광지 간 이동 경로 보정
                    if (places.isArray() && places.size() > 1) {
                        for (int i = 1; i < places.size(); i++) {
                            JsonNode prev = places.get(i - 1);
                            JsonNode curr = places.get(i);
                            
                            BigDecimal prevX = getBigDecimalSafe(prev, "map_x");
                            BigDecimal prevY = getBigDecimalSafe(prev, "map_y");
                            BigDecimal currX = getBigDecimalSafe(curr, "map_x");
                            BigDecimal currY = getBigDecimalSafe(curr, "map_y");
                            
                            Map<String, Object> kakaoResult = kakaoMobilityClient.getDirections(prevX, prevY, currX, currY);
                            if (Boolean.TRUE.equals(kakaoResult.get("success"))) {
                                int durationSeconds = (int) kakaoResult.get("duration");
                                int durationMinutes = (int) Math.round(durationSeconds / 60.0);
                                int cost = 0;
                                
                                if ("자차".equals(transportation)) {
                                    cost = (int) kakaoResult.get("toll_fare");
                                } else {
                                    cost = (int) kakaoResult.get("taxi_fare");
                                }
                                
                                ObjectNode currObj = (ObjectNode) curr;
                                ObjectNode transportNode = mapper.createObjectNode();
                                transportNode.put("type", transportation != null ? transportation : "자차");
                                transportNode.put("route_descrption", String.format("카카오 추천 경로 이동 (약 %d분 소요)", durationMinutes));
                                transportNode.put("estimated_cost", cost);
                                currObj.set("transport", transportNode);
                            }
                        }
                    }
                    
                    // 2. 숙소로의 이동 경로 보정
                    JsonNode acc = dayPlan.path("accommodation");
                    if (places.isArray() && places.size() > 0 && !acc.isMissingNode() && !acc.isNull()) {
                        JsonNode lastPlace = places.get(places.size() - 1);
                        BigDecimal prevX = getBigDecimalSafe(lastPlace, "map_x");
                        BigDecimal prevY = getBigDecimalSafe(lastPlace, "map_y");
                        BigDecimal accX = getBigDecimalSafe(acc, "map_x");
                        BigDecimal accY = getBigDecimalSafe(acc, "map_y");
                        
                        Map<String, Object> kakaoResult = kakaoMobilityClient.getDirections(prevX, prevY, accX, accY);
                        if (Boolean.TRUE.equals(kakaoResult.get("success"))) {
                            int durationSeconds = (int) kakaoResult.get("duration");
                            int durationMinutes = (int) Math.round(durationSeconds / 60.0);
                            int cost = 0;
                            
                            if ("자차".equals(transportation)) {
                                cost = (int) kakaoResult.get("toll_fare");
                            } else {
                                cost = (int) kakaoResult.get("taxi_fare");
                            }
                            
                            ObjectNode accObj = (ObjectNode) acc;
                            ObjectNode transportNode = mapper.createObjectNode();
                            transportNode.put("type", transportation != null ? transportation : "자차");
                            transportNode.put("route_descrption", String.format("카카오 추천 경로 이동 (약 %d분 소요)", durationMinutes));
                            transportNode.put("estimated_cost", cost);
                            accObj.set("transport", transportNode);
                        }
                    }
                }
            }
            
            return mapper.writeValueAsString(rootNode);
        } catch (Exception e) {
            e.printStackTrace();
            return rawJson;
        }
    }

    private BigDecimal getBigDecimalSafe(JsonNode node, String fieldName) {
        JsonNode field = node.path(fieldName);
        if (field.isNumber()) {
            return new BigDecimal(field.asText());
        }
        return BigDecimal.ZERO;
    }
}
