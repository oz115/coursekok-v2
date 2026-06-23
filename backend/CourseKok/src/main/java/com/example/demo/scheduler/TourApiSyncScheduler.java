package com.example.demo.scheduler;

import com.example.demo.repository.PlaceRepository;
import com.example.demo.service.TourApiSyncService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
public class TourApiSyncScheduler {

    private static final Logger log = LoggerFactory.getLogger(TourApiSyncScheduler.class);

    private final TourApiSyncService tourApiSyncService;
    private final PlaceRepository placeRepository;

    public TourApiSyncScheduler(TourApiSyncService tourApiSyncService, PlaceRepository placeRepository) {
        this.tourApiSyncService = tourApiSyncService;
        this.placeRepository = placeRepository;
    }

    /**
     * 매일 새벽 3시에 한국관광공사 API 전체 데이터 동기화 배치를 수행합니다.
     */
    // @Scheduled(cron = "0 0 3 * * *")
    @Scheduled(fixedDelay = 600000)
    public void scheduleDailySync() {
        log.info("새벽 3시 정기 TourAPI 동기화 스케줄러를 가동합니다.");
        try {
            tourApiSyncService.syncAllPlaces();
        } catch (Exception e) {
            log.error("정기 동기화 배치 도중 에러가 발생했습니다.", e);
        }
    }

    /**
     * 서버 최초 가동 시점에 DB가 비어 있는 경우(관광지 데이터가 0건인 경우),
     * 즉시 전체 동기화를 비동기로 1회 실행합니다.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("서버 기동 완료를 감지하여 최초 데이터 적재 검사를 수행합니다.");
        long placeCount = placeRepository.count();
        log.info("현재 DB 내 관광지 데이터 개수: {}개", placeCount);

        if (placeCount == 0) {
            log.info("DB가 비어있음을 확인하였습니다. 즉시 첫 동기화 작업을 강제 실행합니다 (비동기 수행).");
            // 서버 시작 흐름을 블로킹하지 않기 위해 별도 스레드에서 실행
            new Thread(() -> {
                try {
                    tourApiSyncService.syncAllPlaces();
                } catch (Exception e) {
                    log.error("최초 기동 강제 동기화 실패", e);
                }
            }, "TourApiInitialSyncThread").start();
        } else {
            log.info("이미 DB에 데이터가 존재합니다. 최초 강제 동기화를 건너뜁니다.");
        }
    }
}
