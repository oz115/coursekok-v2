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

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TripService {

    private final TripRepository tripRepository;
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
                .map(TripSummaryResponse::from)
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

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(req.aiPlanSnapshot());
            JsonNode dayPlans = rootNode.path("day_plans");
            
            log.info("[TripService] day_plans 노드 존재 여부: {}, 크기: {}", dayPlans.isArray(), dayPlans.size());
            
            if (dayPlans.isArray()) {
                for (JsonNode dayPlan : dayPlans) {
                    int dayNumber = dayPlan.path("day_number").asInt();
                    LocalDate tripDate = req.startDate().plusDays(dayNumber - 1);

                    TripDay tripDay = TripDay.builder()
                            .trip(savedTrip)
                            .dayNumber(dayNumber)
                            .tripDate(tripDate)
                            .build();

                    // 2. TripDay 명시적 저장
                    TripDay savedDay = tripDayRepository.save(tripDay);
                    log.info("[TripService] TripDay 저장 완료. Day: {}, Date: {}, ID: {}", dayNumber, tripDate, savedDay.getId());

                    JsonNode places = dayPlan.path("places");
                    int maxVisitOrder = 0;
                    if (places.isArray()) {
                        log.info("[TripService] Day {} - places 크기: {}", dayNumber, places.size());
                        for (JsonNode placeNode : places) {
                            long placeId = placeNode.path("place_id").asLong();
                            int visitOrder = placeNode.path("visit_order").asInt();
                            if (visitOrder > maxVisitOrder) {
                                maxVisitOrder = visitOrder;
                            }
                            String memo = placeNode.has("memo") ? placeNode.path("memo").asText() : null;

                            Place place = placeRepository.findById(placeId)
                                    .orElseThrow(() -> new NoSuchElementException("장소를 찾을 수 없습니다. ID: " + placeId));

                            TripPlace tripPlace = TripPlace.builder()
                                    .tripDay(savedDay)
                                    .place(place)
                                    .visitOrder(visitOrder)
                                    .memo(memo)
                                    .build();
                            
                            // 3. TripPlace 명시적 저장
                            TripPlace savedPlace = tripPlaceRepository.save(tripPlace);
                            log.info("[TripService] TripPlace 저장 완료 (관광지). Place ID: {}, Order: {}, ID: {}", placeId, visitOrder, savedPlace.getId());
                        }
                    }

                    // 숙소가 존재한다면 숙소도 trip_places에 저장
                    JsonNode accNode = dayPlan.path("accommodation");
                    if (!accNode.isMissingNode() && !accNode.isNull() && accNode.has("place_id")) {
                        long accPlaceId = accNode.path("place_id").asLong();
                        String reason = accNode.has("reason") ? accNode.path("reason").asText() : null;

                        Place accPlace = placeRepository.findById(accPlaceId)
                                .orElseThrow(() -> new NoSuchElementException("숙소를 찾을 수 없습니다. ID: " + accPlaceId));

                        TripPlace tripPlace = TripPlace.builder()
                                .tripDay(savedDay)
                                .place(accPlace)
                                .visitOrder(maxVisitOrder + 1)
                                .memo(reason) // 숙소의 경우 추천 사유(reason)를 한줄 메모로
                                .build();
                        
                        // 4. 숙소용 TripPlace 명시적 저장
                        TripPlace savedAcc = tripPlaceRepository.save(tripPlace);
                        log.info("[TripService] TripPlace 저장 완료 (숙소). Place ID: {}, Order: {}, ID: {}", accPlaceId, maxVisitOrder + 1, savedAcc.getId());
                    }
                }
            }
        } catch (Exception e) {
            log.error("[TripService] AI 플랜 상세 저장 중 오류 발생", e);
            throw new RuntimeException("AI 플랜 파싱 및 상세 저장 실패: " + e.getMessage(), e);
        }

        return TripDetailResponse.from(savedTrip);
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
