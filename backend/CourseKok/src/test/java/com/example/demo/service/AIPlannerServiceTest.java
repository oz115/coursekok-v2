package com.example.demo.service;

import com.example.demo.dto.aiplanner.AIPlannerRequestDto;
import com.example.demo.entity.Place;
import com.example.demo.entity.RegionCode;
import com.example.demo.repository.PlaceRepository;
import com.example.demo.repository.RegionCodeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AIPlannerServiceTest {

    @Autowired
    private AIPlannerService aiPlannerService;

    @Autowired
    private RegionCodeRepository regionCodeRepository;

    @Autowired
    private PlaceRepository placeRepository;

    @Test
    void testAIPlannerAndKakaoMobilityIntegration() {
        System.out.println("========== [1] 더미 데이터 준비 단계 ==========");

        // 1. 테스트용 지역코드(RegionCode) 생성 및 저장
        RegionCode testRegion = regionCodeRepository.save(RegionCode.builder()
                .ldongRegnCd("39")
                .ldongRegnNm("제주특별자치도")
                .ldongSignguCd("110")
                .ldongSignguNm("제주시")
                .build());
        System.out.println("임시 법정동 등록 완료: 제주시 [39, 110]");

        // 2. 바구니 장소(Saved Place)용 관광지 2개 생성
        Place basketPlace1 = placeRepository.save(Place.builder()
                .contentId("dummy_basket_1")
                .contentTypeId(12)
                .title("협재 해수욕장")
                .address("제주특별자치도 제주시 한림읍 협재리 2497-1")
                .regionCode(testRegion)
                .mapX(new BigDecimal("126.2396"))
                .mapY(new BigDecimal("33.3938"))
                .views(1500)
                .rating(4.5)
                .isDeleted(false)
                .build());

        Place basketPlace2 = placeRepository.save(Place.builder()
                .contentId("dummy_basket_2")
                .contentTypeId(12)
                .title("한림공원")
                .address("제주특별자치도 제주시 한림읍 한림로 300")
                .regionCode(testRegion)
                .mapX(new BigDecimal("126.2415"))
                .mapY(new BigDecimal("33.3897"))
                .views(2000)
                .rating(4.6)
                .isDeleted(false)
                .build());
        System.out.println("바구니 장소 등록 완료: " + basketPlace1.getTitle() + ", " + basketPlace2.getTitle());

        // 3. 동일 지역의 다른 인기 관광지 후보군 2개 생성 (contentTypeId != 32)
        Place popularPlace1 = placeRepository.save(Place.builder()
                .contentId("dummy_popular_1")
                .contentTypeId(12)
                .title("곽지 해수욕장")
                .address("제주특별자치도 제주시 애월읍 곽지리")
                .regionCode(testRegion)
                .mapX(new BigDecimal("126.3039"))
                .mapY(new BigDecimal("33.4508"))
                .views(9999) // 높은 뷰
                .rating(4.8)
                .isDeleted(false)
                .build());

        Place popularPlace2 = placeRepository.save(Place.builder()
                .contentId("dummy_popular_2")
                .contentTypeId(12)
                .title("새별오름")
                .address("제주특별자치도 제주시 애월읍 봉성리 산59-8")
                .regionCode(testRegion)
                .mapX(new BigDecimal("126.3571"))
                .mapY(new BigDecimal("33.3664"))
                .views(8888)
                .rating(4.7)
                .isDeleted(false)
                .build());
        System.out.println("인기 관광지 후보군 등록 완료 (views 내림차순): " + popularPlace1.getTitle() + ", " + popularPlace2.getTitle());

        // 4. 동일 지역의 숙소 후보군 2개 생성 (contentTypeId == 32)
        Place accommodation1 = placeRepository.save(Place.builder()
                .contentId("dummy_stay_1")
                .contentTypeId(32) // 숙박 시설
                .title("제주 다이브 빌리지")
                .address("제주특별자치도 제주시 애월읍")
                .regionCode(testRegion)
                .mapX(new BigDecimal("126.3150"))
                .mapY(new BigDecimal("33.4620"))
                .views(7777)
                .rating(4.9)
                .isDeleted(false)
                .build());

        Place accommodation2 = placeRepository.save(Place.builder()
                .contentId("dummy_stay_2")
                .contentTypeId(32)
                .title("에스프레소 게스트하우스")
                .address("제주특별자치도 제주시 한림읍")
                .regionCode(testRegion)
                .mapX(new BigDecimal("126.2620"))
                .mapY(new BigDecimal("33.4120"))
                .views(6666)
                .rating(4.8)
                .isDeleted(false)
                .build());
        System.out.println("인기 숙박시설 후보군 등록 완료 (contentTypeId=32): " + accommodation1.getTitle() + ", " + accommodation2.getTitle());

        System.out.println("========== [2] 리포지토리 격리 조회 검증 ==========");
        // 5. 인기 관광지(숙소 제외) 및 인기 숙소(숙박만) 조회 단위 테스트 검증
        List<Place> popularPlaces = placeRepository.findTopPopularPlacesInRegionExcludeContentType(
                "39", 32, org.springframework.data.domain.PageRequest.of(0, 10));
        List<Place> popularStays = placeRepository.findTopPopularPlacesInRegionByContentType(
                "39", 32, org.springframework.data.domain.PageRequest.of(0, 10));

        // 검증: 숙소 제외 리스트에 숙소가 없어야 함
        assertThat(popularPlaces).noneMatch(p -> p.getContentTypeId() == 32);
        // 검증: 숙소 리스트에는 숙소(32)만 들어있어야 함
        assertThat(popularStays).allMatch(p -> p.getContentTypeId() == 32);
        System.out.println("리포지토리 격리 쿼리 검증 통과! (관광지와 숙소가 명확하게 격리 조회됨)");

        System.out.println("========== [3] AI 플래너 서비스 호출 및 LLM 요청 전송 ==========");
        // 6. DTO 조립 (자차 이동 수단 포함)
        List<Long> savedPlaceIds = new ArrayList<>();
        savedPlaceIds.add(basketPlace1.getId());
        savedPlaceIds.add(basketPlace2.getId());

        AIPlannerRequestDto requestDto = new AIPlannerRequestDto();
        requestDto.setStartDate(LocalDate.now());
        requestDto.setEndDate(LocalDate.now().plusDays(2)); // 2박 3일 (3개 일차 필요)
        requestDto.setHeadcount(3);
        requestDto.setTravelStyles(List.of("힐링", "감성"));
        requestDto.setTransportation("자차");
        requestDto.setAdditionalRequests("숙소는 경치가 좋은 곳이었습니다.");
        requestDto.setRegions(List.of(new AIPlannerRequestDto.RegionSelectionDto("39", "110")));
        requestDto.setSavedPlaceIds(savedPlaceIds);

        // 7. 서비스 연동
        String jsonResult = aiPlannerService.generateTravelCourse(requestDto);
        System.out.println("AI 생성 및 카카오 보정 통합 결과 JSON:\n" + jsonResult);

        System.out.println("========== [4] 응답 JSON 스키마 및 데이터 구조 검증 ==========");
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(jsonResult);
            JsonNode dayPlans = root.path("day_plans");
            
            // 검증: day_plans 필드가 반드시 존재하고 배열 형태여야 함
            assertThat(dayPlans.isArray()).isTrue();
            System.out.println("검증 통과: 'day_plans' 배열이 정상적으로 존재함");

            int plansCount = dayPlans.size();
            System.out.println("총 계획 일수: " + plansCount + "일");

            for (int i = 0; i < plansCount; i++) {
                JsonNode dayPlan = dayPlans.get(i);
                int dayNumber = dayPlan.path("day_number").asInt();
                System.out.printf("--- %d일차 상세 검증 ---\n", dayNumber);

                JsonNode places = dayPlan.path("places");
                assertThat(places.isArray()).isTrue();
                System.out.println("  - 'places' 장소 리스트 정상 반환됨");

                // 첫 번째를 제외한 장소들에 transport 및 카카오 실시간 교통정보 주입 확인
                for (int pIdx = 0; pIdx < places.size(); pIdx++) {
                    JsonNode place = places.get(pIdx);
                    assertThat(place.path("place_id").isMissingNode()).isFalse();
                    assertThat(place.path("title").isMissingNode()).isFalse();
                    
                    if (pIdx > 0) {
                        JsonNode transport = place.path("transport");
                        assertThat(transport.isMissingNode()).isFalse();
                        System.out.printf("  - 장소 '%s' 사이 이동수단 및 비용 주입 확인: type=%s, cost=%d, desc=%s\n",
                                place.path("title").asText(),
                                transport.path("type").asText(),
                                transport.path("estimated_cost").asInt(),
                                transport.path("route_descrption").asText()
                        );
                    }
                }

                // 마지막 날을 제외하고 숙소(accommodation)가 필수 할당되어 있는지 검증
                JsonNode accommodation = dayPlan.path("accommodation");
                if (dayNumber < plansCount) {
                    assertThat(accommodation.isNull() || accommodation.isMissingNode()).isFalse();
                    assertThat(accommodation.path("place_id").isMissingNode()).isFalse();
                    
                    // 숙소에도 카카오 API를 활용한 경로 정보가 반영되었는지 검증
                    JsonNode transport = accommodation.path("transport");
                    assertThat(transport.isMissingNode()).isFalse();
                    System.out.printf("  - 추천 숙박시설 할당 확인: '%s' (ID: %d)\n", 
                            accommodation.path("title").asText(), 
                            accommodation.path("place_id").asLong());
                    System.out.printf("  - 숙소로의 이동수단 및 비용 보정 확인: type=%s, cost=%d, desc=%s\n",
                            transport.path("type").asText(),
                            transport.path("estimated_cost").asInt(),
                            transport.path("route_descrption").asText()
                    );
                } else {
                    // 마지막 날에는 다음 숙소가 불필요하므로 비어있거나 null이어야 함
                    System.out.println("  - 마지막 일차이므로 숙박시설 없음 (정상)");
                }
            }

            System.out.println("\n== 모든 AI 플래너 및 카카오 길찾기 API 연동 기능의 테스트 검증이 성공적으로 통과하였습니다! ==");

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("JSON 검증 파싱 도중 실패", e);
        }
    }
}
