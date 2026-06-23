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
            log.info("TourAPI 법정동 기반 동기화를 시작합니다. (제한 파라미터: {})", maxPages);
            LocalDateTime syncStartTime = LocalDateTime.now();

            // 0. 기존 Fallback(99/999)으로 수집된 오염된 관광지 및 지역 코드 데이터 정리
            log.info("기존 Fallback(99/999) 오염 데이터를 정리합니다...");
            placeRepository.deleteByRegionCodeLdongRegnCd("99");
            regionCodeRepository.deleteByLdongRegnCd("99");

            // 1. 시도 법정동 코드 목록 조회
            log.info("1단계: 시도 법정동 코드 목록 조회 중...");
            com.example.demo.dto.tourapi.LdongCodeResponse sidoResponse = tourApiClient.getLdongSidoCode();
            if (sidoResponse == null || sidoResponse.getResponse() == null ||
                sidoResponse.getResponse().getBody() == null ||
                sidoResponse.getResponse().getBody().getItems() == null ||
                sidoResponse.getResponse().getBody().getItems().getItem() == null ||
                sidoResponse.getResponse().getBody().getItems().getItem().isEmpty()) {
                log.warn("시도 법정동 코드 데이터를 조회하지 못했습니다. 동기화를 종료합니다.");
                isSyncing.set(false);
                return;
            }

            List<com.example.demo.dto.tourapi.LdongCodeItem> sidos = sidoResponse.getResponse().getBody().getItems().getItem();
            log.info("조회된 시도 개수: {}개", sidos.size());

            // 2. 각 시도별 시군구 수집 및 RegionCode 적재
            log.info("2단계: 시도별 시군구 법정동 수집 및 RegionCode DB 구축 중...");
            
            // 기존 캐시 로딩
            List<RegionCode> allRegionCodes = regionCodeRepository.findAll();
            Map<String, RegionCode> regionCodeMap = allRegionCodes.stream()
                    .collect(Collectors.toMap(
                            r -> r.getLdongRegnCd().trim() + "_" + r.getLdongSignguCd().trim(),
                            Function.identity(),
                            (existing, replacement) -> existing
                    ));

            for (com.example.demo.dto.tourapi.LdongCodeItem sido : sidos) {
                String sidoCode = sido.getCode().trim();
                String sidoName = sido.getName().trim();

                com.example.demo.dto.tourapi.LdongCodeResponse sigunguResponse = tourApiClient.getLdongSigunguCode(sidoCode);
                if (sigunguResponse == null || sigunguResponse.getResponse() == null ||
                    sigunguResponse.getResponse().getBody() == null ||
                    sigunguResponse.getResponse().getBody().getItems() == null ||
                    sigunguResponse.getResponse().getBody().getItems().getItem() == null) {
                    continue;
                }

                List<com.example.demo.dto.tourapi.LdongCodeItem> sigungus = sigunguResponse.getResponse().getBody().getItems().getItem();
                for (com.example.demo.dto.tourapi.LdongCodeItem sigungu : sigungus) {
                    String sigunguCode = sigungu.getCode().trim();
                    String sigunguName = sigungu.getName().trim();
                    String regionKey = sidoCode + "_" + sigunguCode;

                    if (!regionCodeMap.containsKey(regionKey)) {
                        RegionCode newRegion = RegionCode.builder()
                                .ldongRegnCd(sidoCode)
                                .ldongRegnNm(sidoName)
                                .ldongSignguCd(sigunguCode)
                                .ldongSignguNm(sigunguName)
                                .build();
                        RegionCode saved = regionCodeRepository.save(newRegion);
                        regionCodeMap.put(regionKey, saved);
                        log.info("신규 법정동 지역코드를 등록했습니다: [{}, {}] -> {} {}", 
                                sidoCode, sigunguCode, sidoName, sigunguName);
                    }
                }
            }

            // 3. 지역별 관광지 조회 및 벌크 적재
            log.info("3단계: 유효한 지역별로 관광지 데이터를 조회하여 적재 중...");
            
            // 기존 장소 정보 캐싱
            List<Place> allPlaces = placeRepository.findAll();
            Map<String, Place> placeMap = allPlaces.stream()
                    .collect(Collectors.toMap(
                            p -> p.getContentId().trim(),
                            Function.identity(),
                            (existing, replacement) -> existing
                    ));

            List<Place> placesToSave = new ArrayList<>();
            int processedCount = 0;
            int sigungusSynced = 0;

            // 시군구별 동기화 루프 실행
            for (RegionCode region : regionCodeMap.values()) {
                // 테스트 제한용 차단
                if (maxPages != Integer.MAX_VALUE && sigungusSynced >= maxPages) {
                    log.info("테스트 제한 조건(maxPages: {})에 도달하여 데이터 수집 루프를 종료합니다.", maxPages);
                    break;
                }

                String regnCd = region.getLdongRegnCd().trim();
                String signguCd = region.getLdongSignguCd().trim();

                int pageNo = 1;
                boolean hasMore = true;

                log.info("지역 동기화 시작: {} {} [{}, {}]", 
                        region.getLdongRegnNm(), region.getLdongSignguNm(), regnCd, signguCd);

                while (hasMore) {
                    TourApiResponse apiResponse = tourApiClient.getAreaBasedList(1000, pageNo, regnCd, signguCd);
                    if (apiResponse == null || apiResponse.getResponse() == null || apiResponse.getResponse().getBody() == null) {
                        break;
                    }

                    TourApiResponse.Body body = apiResponse.getResponse().getBody();
                    if (body.getItems() == null || body.getItems().getItem() == null || body.getItems().getItem().isEmpty()) {
                        break;
                    }

                    List<TourApiItem> items = body.getItems().getItem();
                    for (TourApiItem item : items) {
                        if (item.getContentId() == null || item.getContentId().trim().isEmpty()) {
                            continue;
                        }

                        // Jackson 바인딩 대소문자 패치 완료에 따라 정상 수신됨
                        String itemRegnCd = (item.getLdongRegnCd() != null) ? item.getLdongRegnCd().trim() : regnCd;
                        String itemSignguCd = (item.getLdongSignguCd() != null) ? item.getLdongSignguCd().trim() : signguCd;
                        String regionKey = itemRegnCd + "_" + itemSignguCd;

                        RegionCode matchedRegion = regionCodeMap.get(regionKey);
                        if (matchedRegion == null) {
                            matchedRegion = region;
                        }

                        // 좌표 파싱
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
                            // 파싱 에러
                        }

                        String address = concatAddress(item.getAddr1(), item.getAddr2());
                        String title = item.getTitle() != null ? item.getTitle().trim() : "정보 없음";
                        Integer contentTypeId = item.getContentTypeId() != null ? item.getContentTypeId() : 12;

                        Place existing = placeMap.get(item.getContentId().trim());
                        Place placeToSave;

                        if (existing != null) {
                            placeToSave = Place.builder()
                                    .id(existing.getId())
                                    .contentId(existing.getContentId())
                                    .contentTypeId(contentTypeId)
                                    .title(title)
                                    .address(address)
                                    .regionCode(matchedRegion)
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
                                    .views(existing.getViews())
                                    .rating(existing.getRating())
                                    .isDeleted(false)
                                    .createdAt(existing.getCreatedAt())
                                    .build();
                        } else {
                            placeToSave = Place.builder()
                                    .contentId(item.getContentId().trim())
                                    .contentTypeId(contentTypeId)
                                    .title(title)
                                    .address(address)
                                    .regionCode(matchedRegion)
                                    .lclsSystm1(item.getLclsSystm1())
                                    .lclsSystm2(item.getLclsSystm2())
                                    .lclsSystm3(item.getLclsSystm3())
                                    .mapX(mapX)
                                    .mapY(mapY)
                                    .firstImage(item.getFirstImage())
                                    .firstImage2(item.getFirstImage2())
                                    .cpyrhtDivCd(item.getCpyrhtDivCd())
                                    .tel(item.getTel())
                                    .views((int)(Math.random() * 10000))
                                    .rating(Math.round((Math.random() * 5.0) * 10.0) / 10.0)
                                    .isDeleted(false)
                                    .build();
                        }

                        placesToSave.add(placeToSave);
                        processedCount++;
                    }

                    // 페이징 판단
                    int totalCount = (body.getTotalCount() != null) ? body.getTotalCount() : 0;
                    if (totalCount > pageNo * 1000) {
                        pageNo++;
                    } else {
                        hasMore = false;
                    }
                }

                sigungusSynced++;

                // OOM 방지 및 대량 데이터 처리 분할 저장
                if (placesToSave.size() >= 2000) {
                    log.info("장소 데이터 중간 벌크 저장 실행 ({}건)...", placesToSave.size());
                    placeRepository.saveAll(placesToSave);
                    placesToSave.clear();
                }
            }

            // 남은 관광지 일괄 저장
            if (!placesToSave.isEmpty()) {
                log.info("남은 장소 데이터 최종 벌크 저장 실행 ({}건)...", placesToSave.size());
                placeRepository.saveAll(placesToSave);
                placesToSave.clear();
            }

            log.info("TourAPI 데이터 처리가 완료되었습니다. 총 처리된 아이템 개수: {}개", processedCount);

            // 누락된 데이터 Soft Delete 처리 (이번 배치 실행 과정에서 최종 업데이트가 반영되지 않은 기존 활성 장소 제거)
            if (processedCount > 0) {
                log.info("배치 동기화 시작 시간({}) 이전에 마지막으로 수정된(누락된) 장소를 Soft Delete 처리합니다.", syncStartTime);
                placeRepository.softDeleteMissingPlacesBefore(syncStartTime);
                log.info("Soft Delete 처리가 완료되었습니다.");
            } else {
                log.warn("동기화 처리된 장소 데이터가 0건이므로 Soft Delete 실행을 건너뜁니다.");
            }

            log.info("TourAPI 법정동 기반 데이터 동기화 배치가 성공적으로 종료되었습니다.");
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
