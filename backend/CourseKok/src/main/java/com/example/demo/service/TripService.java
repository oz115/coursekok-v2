package com.example.demo.service;

import com.example.demo.dto.trip.TripDetailResponse;
import com.example.demo.dto.trip.TripSaveRequest;
import com.example.demo.dto.trip.TripSummaryResponse;
import com.example.demo.entity.Place;
import com.example.demo.entity.Trip;
import com.example.demo.entity.TripDay;
import com.example.demo.entity.TripPlace;
import com.example.demo.entity.User;
import com.example.demo.repository.PlaceRepository;
import com.example.demo.repository.TripLogRepository;
import com.example.demo.repository.TripRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.TripDayRepository;
import com.example.demo.repository.TripPlaceRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TripService {

    private final TripRepository tripRepository;
    private final TripLogRepository tripLogRepository;
    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;
    private final TripDayRepository tripDayRepository;
    private final TripPlaceRepository tripPlaceRepository;

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));
    }

    /** 내 여행 목록 */
    public List<TripSummaryResponse> getMyTrips() {
        User user = currentUser();
        return tripRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(trip -> {
                    var tripLog = tripLogRepository.findFirstByTripIdAndUser(trip.getId(), user).orElse(null);
                    return TripSummaryResponse.from(trip, tripLog);
                })
                .toList();
    }

    /** AI 플랜 저장 */
    @Transactional
    public TripDetailResponse saveTrip(TripSaveRequest req) {
        User user = currentUser();
        
        log.info("[TripService] AI 플랜 저장 시작. Title: {}, User: {}", req.title(), user.getEmail());
        
        Trip trip = Trip.builder()
                .user(user)
                .title(req.title())
                .startDate(req.startDate())
                .endDate(req.endDate())
                .region(req.region())
                .period(req.period())
                .style(req.style())
                .coverImage(req.coverImage())
                .aiPlanSnapshot(req.aiPlanSnapshot())
                .build();

        // 1. 부모 Trip 먼저 명시적 저장
        Trip savedTrip = tripRepository.save(trip);
        log.info("[TripService] 부모 Trip 저장 완료. ID: {}", savedTrip.getId());

        persistTripPlanDetails(savedTrip, req);

        return TripDetailResponse.from(savedTrip);
    }

    /** 여행 수정 */
    @Transactional
    public TripDetailResponse updateTrip(Long tripId, TripSaveRequest req) {
        User user = currentUser();
        Trip trip = tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() -> new NoSuchElementException("여행을 찾을 수 없습니다."));

        trip.updatePlan(
                req.title(),
                req.startDate(),
                req.endDate(),
                req.region(),
                req.period(),
                req.style(),
                req.coverImage(),
                req.aiPlanSnapshot()
        );

        tripPlaceRepository.deleteByTripDay_Trip(trip);
        tripDayRepository.deleteByTrip(trip);
        persistTripPlanDetails(trip, req);

        return TripDetailResponse.from(trip);
    }

    private void persistTripPlanDetails(Trip trip, TripSaveRequest req) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(req.aiPlanSnapshot());
            JsonNode dayPlans = rootNode.path("day_plans");
            if (!dayPlans.isArray() || dayPlans.isEmpty()) {
                dayPlans = rootNode.path("days");
            }

            log.info("[TripService] 일정 노드 존재 여부: {}, 크기: {}", dayPlans.isArray(), dayPlans.size());

            if (dayPlans.isArray()) {
                for (int idx = 0; idx < dayPlans.size(); idx++) {
                    JsonNode dayPlan = dayPlans.get(idx);
                    int dayNumber = resolveDayNumber(dayPlan, idx);
                    LocalDate tripDate = resolveTripDate(req.startDate(), dayNumber);

                    TripDay savedDay = tripDayRepository.save(TripDay.builder()
                            .trip(trip)
                            .dayNumber(dayNumber)
                            .tripDate(tripDate)
                            .build());

                    log.info("[TripService] TripDay 저장 완료. Day: {}, Date: {}, ID: {}", dayNumber, tripDate, savedDay.getId());

                    int lastVisitOrder = saveSnapshotPlaces(savedDay, dayPlan);
                    saveAccommodation(savedDay, dayPlan, lastVisitOrder);
                }
            }
        } catch (Exception e) {
            log.error("[TripService] AI 플랜 상세 저장 중 오류 발생", e);
            throw new RuntimeException("AI 플랜 파싱 및 상세 저장 실패: " + e.getMessage(), e);
        }
    }

    private int resolveDayNumber(JsonNode dayPlan, int idx) {
        if (dayPlan.hasNonNull("day_number")) {
            return dayPlan.path("day_number").asInt();
        }
        if (dayPlan.hasNonNull("day")) {
            return dayPlan.path("day").asInt();
        }
        return idx + 1;
    }

    private LocalDate resolveTripDate(LocalDate startDate, int dayNumber) {
        if (startDate == null) {
            return LocalDate.now().plusDays(dayNumber - 1L);
        }
        return startDate.plusDays(dayNumber - 1L);
    }

    private int saveSnapshotPlaces(TripDay savedDay, JsonNode dayPlan) {
        JsonNode places = dayPlan.path("places");
        if (!places.isArray() || places.isEmpty()) {
            places = dayPlan.path("items");
        }

        int maxVisitOrder = 0;
        if (!places.isArray()) {
            return maxVisitOrder;
        }

        log.info("[TripService] Day {} - places 크기: {}", savedDay.getDayNumber(), places.size());

        for (int idx = 0; idx < places.size(); idx++) {
            JsonNode placeNode = places.get(idx);
            Optional<Place> placeOpt = resolvePlace(placeNode);
            if (placeOpt.isEmpty()) {
                continue;
            }

            int visitOrder = resolveVisitOrder(placeNode, idx);
            maxVisitOrder = Math.max(maxVisitOrder, visitOrder);
            String memo = resolvePlaceMemo(placeNode);

            TripPlace savedPlace = tripPlaceRepository.save(TripPlace.builder()
                    .tripDay(savedDay)
                    .place(placeOpt.get())
                    .visitOrder(visitOrder)
                    .memo(memo)
                    .startTime(parseLocalTime(placeNode.path("time").asText(null)))
                    .build());

            log.info("[TripService] TripPlace 저장 완료. Place ID: {}, Order: {}, ID: {}",
                    placeOpt.get().getId(), visitOrder, savedPlace.getId());
        }

        return maxVisitOrder;
    }

    private void saveAccommodation(TripDay savedDay, JsonNode dayPlan, int maxVisitOrder) {
        JsonNode accNode = dayPlan.path("accommodation");
        if (accNode.isMissingNode() || accNode.isNull() || !accNode.has("place_id")) {
            return;
        }

        Place accPlace = placeRepository.findById(accNode.path("place_id").asLong())
                .orElseThrow(() -> new NoSuchElementException("숙소를 찾을 수 없습니다. ID: " + accNode.path("place_id").asLong()));

        String reason = accNode.has("reason") ? accNode.path("reason").asText() : null;
        TripPlace savedAcc = tripPlaceRepository.save(TripPlace.builder()
                .tripDay(savedDay)
                .place(accPlace)
                .visitOrder(maxVisitOrder + 1)
                .memo(reason)
                .build());

        log.info("[TripService] TripPlace 저장 완료 (숙소). Place ID: {}, Order: {}, ID: {}",
                accPlace.getId(), maxVisitOrder + 1, savedAcc.getId());
    }

    private Optional<Place> resolvePlace(JsonNode placeNode) {
        if (!placeNode.has("place_id") || placeNode.path("place_id").isNull()) {
            return Optional.empty();
        }

        long placeId = placeNode.path("place_id").asLong();
        if (placeId <= 0) {
            return Optional.empty();
        }

        return placeRepository.findById(placeId);
    }

    private int resolveVisitOrder(JsonNode placeNode, int idx) {
        if (placeNode.hasNonNull("visit_order")) {
            return placeNode.path("visit_order").asInt();
        }
        return idx + 1;
    }

    private String resolvePlaceMemo(JsonNode placeNode) {
        if (placeNode.hasNonNull("memo")) {
            return placeNode.path("memo").asText();
        }
        if (placeNode.hasNonNull("userPlan")) {
            return placeNode.path("userPlan").asText();
        }
        if (placeNode.hasNonNull("note")) {
            return placeNode.path("note").asText();
        }
        return null;
    }

    private LocalTime parseLocalTime(String value) {
        try {
            return value == null || value.isBlank() ? null : LocalTime.parse(value);
        } catch (Exception e) {
            return null;
        }
    }

    /** 여행 상세 조회 */
    public TripDetailResponse getTrip(Long tripId) {
        User user = currentUser();
        Trip trip = tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() -> new NoSuchElementException("여행을 찾을 수 없습니다."));
        return TripDetailResponse.from(trip);
    }

    /** 여행 삭제 */
    @Transactional
    public void deleteTrip(Long tripId) {
        User user = currentUser();
        Trip trip = tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() -> new NoSuchElementException("여행을 찾을 수 없습니다."));
        tripRepository.delete(trip);
    }
}
