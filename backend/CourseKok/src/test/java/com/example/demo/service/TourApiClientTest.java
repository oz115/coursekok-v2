package com.example.demo.service;

import com.example.demo.entity.Place;
import com.example.demo.entity.RegionCode;
import com.example.demo.dto.tourapi.TourApiResponse;
import com.example.demo.repository.PlaceRepository;
import com.example.demo.repository.RegionCodeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class TourApiClientTest {

    @Autowired
    private TourApiClient tourApiClient;

    @Autowired
    private RegionCodeRepository regionCodeRepository;

    @Autowired
    private PlaceRepository placeRepository;

    @Autowired
    private TourApiSyncService tourApiSyncService;

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

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    private void cleanDatabase() {
        jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
        jdbcTemplate.execute("TRUNCATE TABLE notices");
        jdbcTemplate.execute("TRUNCATE TABLE trip_log_likes");
        jdbcTemplate.execute("TRUNCATE TABLE trip_log_bookmarks");
        jdbcTemplate.execute("TRUNCATE TABLE trip_log_comments");
        jdbcTemplate.execute("TRUNCATE TABLE trip_place_logs");
        jdbcTemplate.execute("TRUNCATE TABLE trip_logs");
        jdbcTemplate.execute("TRUNCATE TABLE trip_places");
        jdbcTemplate.execute("TRUNCATE TABLE trip_days");
        jdbcTemplate.execute("TRUNCATE TABLE trips");
        jdbcTemplate.execute("TRUNCATE TABLE places");
        jdbcTemplate.execute("TRUNCATE TABLE region_codes");
        jdbcTemplate.execute("TRUNCATE TABLE users");
        jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
    }

    @Test
    void syncAllPlaces_executesSuccessfullyAndUpsertsData() {
        // Given: DB 상태 깨끗하게 비우기
        cleanDatabase();
        
        long initialPlaceCount = placeRepository.count();
        long initialRegionCount = regionCodeRepository.count();
        
        System.out.println("--- Before Sync ---");
        System.out.println("Place Count: " + initialPlaceCount);
        System.out.println("RegionCode Count: " + initialRegionCount);

        // When: 동기화 실행 (테스트 속도 최적화를 위해 1페이지만 동기화)
        tourApiSyncService.syncAllPlaces(1);

        // Then: 데이터 적재 확인
        long finalPlaceCount = placeRepository.count();
        long finalRegionCount = regionCodeRepository.count();

        System.out.println("--- After Sync ---");
        System.out.println("Place Count: " + finalPlaceCount);
        System.out.println("RegionCode Count: " + finalRegionCount);

        assertThat(finalPlaceCount).isGreaterThan(0);
        assertThat(finalRegionCount).isGreaterThan(0);

        // Soft Delete 테스트용 모의 시나리오
        RegionCode dummyRegion = regionCodeRepository.findAll().stream().findFirst()
            .orElseGet(() -> regionCodeRepository.save(RegionCode.builder()
                .ldongRegnCd("99")
                .ldongRegnNm("테스트")
                .ldongSignguCd("999")
                .ldongSignguNm("테스트")
                .build()));

        Place dummyPlace = Place.builder()
            .contentId("dummy_content_id_9999")
            .contentTypeId(12)
            .title("테스트 관광지")
            .address("테스트 주소")
            .regionCode(dummyRegion)
            .mapX(BigDecimal.ZERO)
            .mapY(BigDecimal.ZERO)
            .isDeleted(false)
            .build();
        
        placeRepository.save(dummyPlace);
        
        // syncStartTime 파라미터를 현재 시간 + 1분으로 설정하면
        // 방금 넣은 savedDummy의 updatedAt보다 미래이므로 soft delete 조건에 걸리게 됨
        LocalDateTime futureStart = LocalDateTime.now().plusMinutes(1);
        
        placeRepository.softDeleteMissingPlacesBefore(futureStart);
        
        Place updatedDummy = placeRepository.findByContentId("dummy_content_id_9999").orElseThrow();
        assertThat(updatedDummy.getIsDeleted()).isTrue();
        System.out.println("Soft delete check passed! dummyPlace.isDeleted=" + updatedDummy.getIsDeleted());

        // 테스트 완료 후 더미 데이터 제거
        placeRepository.delete(updatedDummy);

        // 테스트 검증을 위해 미래 시간으로 일괄 Soft Delete 처리했던 실제 데이터의 is_deleted 상태를 false로 복구합니다.
        jdbcTemplate.execute("UPDATE places SET is_deleted = 0");
        System.out.println("Restored is_deleted = 0 for actual places in DB.");
    }

    @Test
    void debugDataInDb() {
        System.out.println("========== DB DATA DEBUG ==========");
        long placeCount = placeRepository.count();
        long regionCount = regionCodeRepository.count();
        System.out.println("Place Count: " + placeCount);
        System.out.println("RegionCode Count: " + regionCount);
        
        System.out.println("--- Region Codes (first 10) ---");
        regionCodeRepository.findAll().stream().limit(10).forEach(r -> {
            System.out.printf("ID: %d, ldongRegnCd: '%s', ldongRegnNm: '%s', ldongSignguCd: '%s', ldongSignguNm: '%s'\n",
                r.getId(), r.getLdongRegnCd(), r.getLdongRegnNm(), r.getLdongSignguCd(), r.getLdongSignguNm());
        });
        
        System.out.println("--- Places (first 10) ---");
        placeRepository.findAll().stream().limit(10).forEach(p -> {
            System.out.printf("ID: %d, contentId: '%s', title: '%s', regionCode: %s, isDeleted: %b\n",
                p.getId(), p.getContentId(), p.getTitle(), 
                p.getRegionCode() != null ? String.format("['%s', '%s']", p.getRegionCode().getLdongRegnCd(), p.getRegionCode().getLdongSignguCd()) : "null", 
                p.getIsDeleted());
        });
        System.out.println("===================================");
    }
}
