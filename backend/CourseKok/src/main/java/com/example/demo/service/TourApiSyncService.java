package com.example.demo.service;

import com.example.demo.entity.Place;
import com.example.demo.entity.RegionCode;
import com.example.demo.dto.tourapi.TourApiItem;
import com.example.demo.dto.tourapi.TourApiResponse;
import com.example.demo.repository.PlaceRepository;
import com.example.demo.repository.RegionCodeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.util.function.Function;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class TourApiSyncService {

    private static final Logger log = LoggerFactory.getLogger(TourApiSyncService.class);

    private final TourApiClient tourApiClient;
    private final PlaceRepository placeRepository;
    private final RegionCodeRepository regionCodeRepository;

    private final AtomicBoolean isSyncing = new AtomicBoolean(false);

    public TourApiSyncService(TourApiClient tourApiClient,
                              PlaceRepository placeRepository,
                              RegionCodeRepository regionCodeRepository) {
        this.tourApiClient = tourApiClient;
        this.placeRepository = placeRepository;
        this.regionCodeRepository = regionCodeRepository;
    }

    @Transactional
    public void syncAllPlaces() {
        syncAllPlaces(Integer.MAX_VALUE);
    }

    /**
     * 한국관광공사 TourAPI의 모든 관광지 정보를 단일 대량 호출로 가져와 DB에 Upsert하고,
     * 응답에서 빠진 기존 관광지는 Soft Delete 처리합니다.
     * DB 라운드트립 최소화를 위해 인메모리 캐싱 및 saveAll 벌크 최적화를 적용합니다.
     *
     * @param maxPages 동기화할 최대 페이지 수 (테스트 용도 또는 요청 범위 한정)
     */
    @Transactional
    public void syncAllPlaces(int maxPages) {
        if (!isSyncing.compareAndSet(false, true)) {
            log.warn("이미 데이터 동기화가 진행 중입니다. 동기화 요청을 건너뜁니다.");
            return;
        }

        try {
            int numOfRows = (maxPages == Integer.MAX_VALUE) ? 100000 : Math.min(maxPages * 1000, 100000);
            log.info("TourAPI 관광지 데이터 동기화 배치를 시작합니다. (요청 로우 수: {})", numOfRows);
            LocalDateTime syncStartTime = LocalDateTime.now();

            log.info("TourAPI 데이터 단일 요청 시작: numOfRows={}", numOfRows);
            TourApiResponse apiResponse = tourApiClient.getAreaBasedList(numOfRows, 1);

            if (apiResponse == null || apiResponse.getResponse() == null || apiResponse.getResponse().getBody() == null) {
                log.warn("응답 데이터가 없거나 비어 있습니다. 동기화를 종료합니다.");
                isSyncing.set(false);
                return;
            }

            TourApiResponse.Body body = apiResponse.getResponse().getBody();
            if (body.getItems() == null || body.getItems().getItem() == null || body.getItems().getItem().isEmpty()) {
                log.info("가져온 데이터 항목이 없습니다. 동기화를 종료합니다.");
                isSyncing.set(false);
                return;
            }

            List<TourApiItem> items = body.getItems().getItem();
            log.info("총 {}개의 관광지 아이템을 조회했습니다. 캐싱 및 벌크 저장 최적화를 시작합니다.", items.size());

            // 1. 기존 DB 데이터 캐싱 (SELECT 쿼리 최소화)
            log.info("DB 내 모든 RegionCode 및 Place 데이터를 메모리에 로딩합니다...");
            
            List<RegionCode> allRegionCodes = regionCodeRepository.findAll();
            Map<String, RegionCode> regionCodeMap = allRegionCodes.stream()
                    .collect(Collectors.toMap(
                            r -> r.getLdongRegnCd().trim() + "_" + r.getLdongSignguCd().trim(),
                            Function.identity(),
                            (existing, replacement) -> existing
                    ));

            List<Place> allPlaces = placeRepository.findAll();
            Map<String, Place> placeMap = allPlaces.stream()
                    .collect(Collectors.toMap(
                            p -> p.getContentId().trim(),
                            Function.identity(),
                            (existing, replacement) -> existing
                    ));

            log.info("메모리 캐시 완료: RegionCode={}개, Place={}개", regionCodeMap.size(), placeMap.size());

            List<Place> placesToSave = new ArrayList<>();
            int processedCount = 0;

            for (TourApiItem item : items) {
                if (item.getContentId() == null || item.getContentId().trim().isEmpty()) {
                    continue;
                }

                // 법정동 시도/시군구 코드 획득 및 검증
                String regnCd = item.getLDongRegnCd();
                String signguCd = item.getLDongSignguCd();

                // 시도/시군구 코드가 없을 경우의 Fallback
                if (regnCd == null || regnCd.trim().isEmpty()) {
                    regnCd = "99";
                }
                if (signguCd == null || signguCd.trim().isEmpty()) {
                    signguCd = "999";
                }

                String finalRegnCd = regnCd.trim();
                String finalSignguCd = signguCd.trim();
                String regionKey = finalRegnCd + "_" + finalSignguCd;

                // 캐시에서 RegionCode 획득
                RegionCode regionCode = regionCodeMap.get(regionKey);
                if (regionCode == null) {
                    String regnNm = "기타";
                    String signguNm = "기타";
                    if (item.getAddr1() != null && !item.getAddr1().trim().isEmpty()) {
                        String[] parts = item.getAddr1().trim().split("\\s+");
                        if (parts.length > 0) regnNm = parts[0];
                        if (parts.length > 1) signguNm = parts[1];
                    }
                    RegionCode newRegion = RegionCode.builder()
                            .ldongRegnCd(finalRegnCd)
                            .ldongRegnNm(regnNm)
                            .ldongSignguCd(finalSignguCd)
                            .ldongSignguNm(signguNm)
                            .build();
                    log.info("신규 법정동 코드를 발견하여 DB 저장 및 캐시에 등록합니다: [{}, {}] -> {} {}", 
                            finalRegnCd, finalSignguCd, regnNm, signguNm);
                    
                    // 신규 지역코드는 즉시 DB에 저장하고 캐시에 등록
                    regionCode = regionCodeRepository.save(newRegion);
                    regionCodeMap.put(regionKey, regionCode);
                }

                // 좌표 파싱 및 Fallback
                BigDecimal mapX = BigDecimal.ZERO;
                BigDecimal mapY = BigDecimal.ZERO;
                try {
                    if (item.getMapX() != null && !item.getMapX().trim().isEmpty()) {
                        mapX = new BigDecimal(item.getMapX().trim());
                    }
                    if (item.getMapY() != null && !item.getMapY().trim().isEmpty()) {
                        mapY = new BigDecimal(item.getMapY().trim());
                    }
                } catch (Exception e) {
                    log.warn("좌표 파싱 오류 (contentId: {}): mapX={}, mapY={}. 0으로 설정합니다.", 
                            item.getContentId(), item.getMapX(), item.getMapY());
                }

                Place existing = placeMap.get(item.getContentId().trim());
                Place placeToSave;

                String address = concatAddress(item.getAddr1(), item.getAddr2());
                String title = item.getTitle() != null ? item.getTitle().trim() : "정보 없음";
                Integer contentTypeId = item.getContentTypeId() != null ? item.getContentTypeId() : 12;

                if (existing != null) {
                    // 기존 데이터가 있을 시 정보 업데이트 (ID 유지하여 수정)
                    placeToSave = Place.builder()
                            .id(existing.getId())
                            .contentId(existing.getContentId())
                            .contentTypeId(contentTypeId)
                            .title(title)
                            .address(address)
                            .regionCode(regionCode)
                            .lclsSystm1(item.getLclsSystm1())
                            .lclsSystm2(item.getLclsSystm2())
                            .lclsSystm3(item.getLclsSystm3())
                            .mapX(mapX)
                            .mapY(mapY)
                            .firstImage(item.getFirstImage())
                            .firstImage2(item.getFirstImage2())
                            .cpyrhtDivCd(item.getCpyrhtDivCd())
                            .tel(item.getTel())
                            .homepage(existing.getHomepage())
                            .overview(existing.getOverview())
                            .isDeleted(false)
                            .createdAt(existing.getCreatedAt())
                            .build();
                } else {
                    // 신규 데이터 생성
                    placeToSave = Place.builder()
                            .contentId(item.getContentId().trim())
                            .contentTypeId(contentTypeId)
                            .title(title)
                            .address(address)
                            .regionCode(regionCode)
                            .lclsSystm1(item.getLclsSystm1())
                            .lclsSystm2(item.getLclsSystm2())
                            .lclsSystm3(item.getLclsSystm3())
                            .mapX(mapX)
                            .mapY(mapY)
                            .firstImage(item.getFirstImage())
                            .firstImage2(item.getFirstImage2())
                            .cpyrhtDivCd(item.getCpyrhtDivCd())
                            .tel(item.getTel())
                            .isDeleted(false)
                            .build();
                }

                placesToSave.add(placeToSave);
                processedCount++;
            }

            // 2. 벌크 저장 실행
            if (!placesToSave.isEmpty()) {
                log.info("총 {}건의 장소 데이터를 DB에 saveAll 벌크 저장합니다...", placesToSave.size());
                placeRepository.saveAll(placesToSave);
                log.info("벌크 저장 완료.");
            }

            log.info("TourAPI 데이터 처리가 완료되었습니다. 총 처리된 아이템 개수: {}개", processedCount);

            // 3. 누락된 데이터 Soft Delete 처리 (기존에 DB에 존재했으나 이번 응답 목록에서 완전히 사라진 데이터)
            if (processedCount > 0) {
                log.info("배치 동기화 시작 시간({}) 이전에 마지막으로 수정된(누락된) 장소를 Soft Delete 처리합니다.", syncStartTime);
                placeRepository.softDeleteMissingPlacesBefore(syncStartTime);
                log.info("Soft Delete 처리가 완료되었습니다.");
            } else {
                log.warn("동기화 처리된 장소 데이터가 0건이므로 Soft Delete 실행을 건너뜁니다.");
            }

            log.info("TourAPI 데이터 동기화 배치가 성공적으로 종료되었습니다.");
        } catch (Exception e) {
            log.error("TourAPI 배치 동기화 도중 치명적인 예외가 발생했습니다.", e);
            throw e;
        } finally {
            isSyncing.set(false);
        }
    }

    private String concatAddress(String addr1, String addr2) {
        StringBuilder sb = new StringBuilder();
        if (addr1 != null && !addr1.trim().isEmpty()) {
            sb.append(addr1.trim());
        }
        if (addr2 != null && !addr2.trim().isEmpty()) {
            if (sb.length() > 0) {
                sb.append(" ");
            }
            sb.append(addr2.trim());
        }
        String address = sb.toString();
        return address.isEmpty() ? "정보 없음" : address;
    }


}
