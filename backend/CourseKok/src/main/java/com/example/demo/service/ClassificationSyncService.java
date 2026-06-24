package com.example.demo.service;

import com.example.demo.entity.ClassificationCode;
import com.example.demo.repository.ClassificationCodeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * 한국관광공사 분류코드 API를 호출하여 classification_codes 테이블에 동기화합니다.
 *
 * <p>서버 최초 기동 시 테이블이 비어 있을 경우 {@link #syncClassificationCodes()}를 호출합니다.
 * 이후에는 이미 데이터가 있으므로 재호출되지 않습니다.</p>
 */
@Service
public class ClassificationSyncService {

    private static final Logger log = LoggerFactory.getLogger(ClassificationSyncService.class);

    private static final String API_BASE_URL =
            "https://apis.data.go.kr/B551011/KorService2/lclsSystmCode2";
    private static final String SERVICE_KEY =
            "49b2a6e30d4df21bfdae4ea228d32986c9c547ccdee135f2b5414f1a3286ed89";

    private final ClassificationCodeRepository classificationCodeRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ClassificationSyncService(ClassificationCodeRepository classificationCodeRepository) {
        this.classificationCodeRepository = classificationCodeRepository;
    }

    /**
     * 분류코드 전체를 API로부터 가져와 DB에 저장합니다.
     * 이미 DB에 동일한 (lclsSystm1, lclsSystm2, lclsSystm3) 조합이 있으면 건너뜁니다.
     */
    @Transactional
    public void syncClassificationCodes() {
        log.info("[ClassificationSync] 한국관광공사 분류코드 동기화를 시작합니다.");

        String url = UriComponentsBuilder.fromUriString(API_BASE_URL)
                .queryParam("serviceKey", SERVICE_KEY)
                .queryParam("MobileApp", "APP")
                .queryParam("MobileOS", "ETC")
                .queryParam("pageNo", 1)
                .queryParam("numOfRows", 1000)
                .queryParam("lclsSystm1", "")
                .queryParam("lclsSystm2", "")
                .queryParam("lclsSystm3", "")
                .queryParam("_type", "json")
                .queryParam("lclsSystmListYn", "Y")
                .build(false)
                .toUriString();

        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("[ClassificationSync] API 응답 오류. HTTP Status: {}", response.statusCode());
                return;
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode items = root
                    .path("response")
                    .path("body")
                    .path("items")
                    .path("item");

            if (items.isMissingNode() || items.isNull()) {
                log.warn("[ClassificationSync] 응답에 item 노드가 없습니다. 응답: {}", response.body().substring(0, Math.min(500, response.body().length())));
                return;
            }

            Set<String> processedKeys = new HashSet<>();
            List<ClassificationCode> toSave = new ArrayList<>();

            // item이 배열이 아닌 단일 객체로 올 수도 있으므로 처리
            Iterable<JsonNode> nodeIterable = items.isArray() ? items : List.of(items);

            for (JsonNode node : nodeIterable) {
                String s1 = nullIfEmpty(node.path("lclsSystm1Cd").asText(null));
                String n1 = nullIfEmpty(node.path("lclsSystm1Nm").asText(null));
                String s2 = nullIfEmpty(node.path("lclsSystm2Cd").asText(null));
                String n2 = nullIfEmpty(node.path("lclsSystm2Nm").asText(null));
                String s3 = nullIfEmpty(node.path("lclsSystm3Cd").asText(null));
                String n3 = nullIfEmpty(node.path("lclsSystm3Nm").asText(null));

                // 1) 대분류
                if (s1 != null && n1 != null) {
                    addIfAbsent(s1, null, null, n1, processedKeys, toSave);
                }
                // 2) 중분류
                if (s1 != null && s2 != null && n2 != null) {
                    addIfAbsent(s1, s2, null, n2, processedKeys, toSave);
                }
                // 3) 소분류
                if (s1 != null && s2 != null && s3 != null && n3 != null) {
                    addIfAbsent(s1, s2, s3, n3, processedKeys, toSave);
                }
            }

            if (!toSave.isEmpty()) {
                classificationCodeRepository.saveAll(toSave);
                log.info("[ClassificationSync] 분류코드 {}건 저장 완료.", toSave.size());
            } else {
                log.info("[ClassificationSync] 저장할 신규 분류코드가 없습니다.");
            }

        } catch (Exception e) {
            log.error("[ClassificationSync] 분류코드 동기화 중 예외가 발생했습니다.", e);
        }
    }

    private void addIfAbsent(String s1, String s2, String s3, String name, Set<String> processedKeys, List<ClassificationCode> toSave) {
        String key = (s1 == null ? "" : s1) + "|" + (s2 == null ? "" : s2) + "|" + (s3 == null ? "" : s3);
        if (processedKeys.contains(key)) {
            return;
        }
        processedKeys.add(key);

        Optional<ClassificationCode> existing =
                classificationCodeRepository.findUnique(s1, s2, s3);
        if (existing.isEmpty()) {
            toSave.add(ClassificationCode.of(s1, s2, s3, name));
        }
    }

    /**
     * lclsSystm1, lclsSystm2, lclsSystm3 코드 조합으로 분류명을 조회합니다.
     */
    public String resolveCodeName(String s1, String s2, String s3) {
        if (s1 == null && s2 == null && s3 == null) return null;
        return classificationCodeRepository
                .findUnique(s1, s2, s3)
                .map(ClassificationCode::getName)
                .orElse(null);
    }

    private String nullIfEmpty(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }
}
