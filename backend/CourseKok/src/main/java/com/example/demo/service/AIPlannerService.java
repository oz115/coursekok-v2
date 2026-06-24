package com.example.demo.service;

import com.example.demo.dto.aiplanner.AIPlannerRequestDto;
import com.example.demo.entity.Place;
import com.example.demo.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
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

@Service
@RequiredArgsConstructor
public class AIPlannerService {

    private final PlaceRepository placeRepository;

    @Value("${gms.api.url}")
    private String gmsApiUrl;

    @Value("${gms.api.key}")
    private String gmsApiKey;

    @SuppressWarnings("unchecked")
    public String generateTravelCourse(AIPlannerRequestDto requestDto) {
        // 1. 바구니 장소 상세 조회
        List<Place> savedPlaces = placeRepository.findAllById(requestDto.getSavedPlaceIds());
        
        String placesInfo = savedPlaces.stream()
                .map(p -> String.format("- %s (주소: %s, 위도: %s, 경도: %s)", 
                        p.getTitle(), p.getAddress(), p.getMapY(), p.getMapX()))
                .collect(Collectors.joining("\n"));

        // 1-2. 바구니 장소와 동일한 지역의 인기 관광지 후보 조회
        String candidatePlacesInfo = "";
        if (!savedPlaces.isEmpty()) {
            String targetLdongRegnCd = savedPlaces.get(0).getRegionCode().getLdongRegnCd();
            if (targetLdongRegnCd != null) {
                List<Place> popularPlaces = placeRepository.findTopPopularPlacesInRegion(
                        targetLdongRegnCd, org.springframework.data.domain.PageRequest.of(0, 30));
                
                Set<Long> savedIds = savedPlaces.stream().map(Place::getId).collect(Collectors.toSet());
                candidatePlacesInfo = popularPlaces.stream()
                        .filter(p -> !savedIds.contains(p.getId()))
                        .map(p -> String.format("- %s (주소: %s, 위도: %s, 경도: %s)", 
                                p.getTitle(), p.getAddress(), p.getMapY(), p.getMapX()))
                        .collect(Collectors.joining("\n"));
            }
        }

        // 2. 프롬프트 작성
        String prompt = String.format(
                "너는 전문 여행 가이드야. 아래 조건들과 장소들을 기반으로 최적의 여행 일정을 구성해줘.\n\n" +
                "[여행 조건]\n" +
                "- 여행 시작일: %s\n" +
                "- 여행 종료일: %s\n" +
                "- 인원수: %d명\n" +
                "- 여행 스타일: %s\n" +
                "- 추가 요청사항: %s\n\n" +
                "[바구니 장소 리스트 (반드시 동선에 최대한 포함시킬 것)]\n" +
                "%s\n\n" +
                "[추가 추천 후보 장소 리스트 (필요 시 코스 보완 및 동선 연결을 위해 아래 장소 중에서 선택하여 구성할 것)]\n" +
                "%s\n\n" +
                "[요구사항]\n" +
                "- 제공된 '바구니 장소 리스트'를 일자별 동선에 맞추어 최대한 골고루 배정하고, 부족한 공간이나 동선 연결이 필요할 경우 '추가 추천 후보 장소 리스트'에 있는 장소들을 적극 선택해 여행 동선(하루 약 3~4개 장소 권장)을 알차게 채워줘.\n" +
                "- 일정에 들어가는 장소는 반드시 '바구니 장소 리스트' 혹은 '추가 추천 후보 장소 리스트'에 제공된 장소 이름과 위도(map_y), 경도(map_x)를 100%% 정확하게 사용해야 해. 임의로 장소 명칭이나 위경도 좌표를 지어내거나 변경해선 절대 안 돼!\n" +
                "- 결과물은 프론트엔드에서 파싱하기 쉽도록 반드시 아래 JSON 포맷으로만 응답해야 해. 설명이나 마크다운 백틱(```) 등 일체의 텍스트는 제외하고 순수한 JSON 데이터만 반환해줘.\n\n" +
                "[JSON 포맷 스키마 예시]\n" +
                "[\n" +
                "  {\n" +
                "    \"day_number\": 1,\n" +
                "    \"visit_order\": 1,\n" +
                "    \"title\": \"장소명\",\n" +
                "    \"map_y\": 33.3938,\n" +
                "    \"map_x\": 126.2396,\n" +
                "    \"memo\": \"이 장소를 방문하는 추천 한줄 이유 및 메모\"\n" +
                "  }\n" +
                "]",
                requestDto.getStartDate(),
                requestDto.getEndDate(),
                requestDto.getHeadcount(),
                String.join(", ", requestDto.getTravelStyles()),
                requestDto.getAdditionalRequests() != null ? requestDto.getAdditionalRequests() : "없음",
                placesInfo.isEmpty() ? "(바구니에 담은 장소가 없습니다.)" : placesInfo,
                candidatePlacesInfo.isEmpty() ? "(후보 장소가 없습니다.)" : candidatePlacesInfo
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
        
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(gmsApiUrl, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("content")) {
                List<Map<String, Object>> contentList = (List<Map<String, Object>>) responseBody.get("content");
                if (contentList != null && !contentList.isEmpty()) {
                    String rawText = (String) contentList.get(0).get("text");
                    return extractJson(rawText);
                }
            }
            return "[]";
        } catch (Exception e) {
            e.printStackTrace();
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
}
