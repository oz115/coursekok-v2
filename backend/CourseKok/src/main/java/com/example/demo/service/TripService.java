package com.example.demo.service;

import com.example.demo.dto.trip.TripDetailResponse;
import com.example.demo.dto.trip.TripSaveRequest;
import com.example.demo.dto.trip.TripSummaryResponse;
import com.example.demo.entity.Trip;
import com.example.demo.entity.User;
import com.example.demo.repository.TripRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;

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
        Trip trip = Trip.builder()
                .user(user)
                .title(req.title())
                .region(req.region())
                .period(req.period())
                .style(req.style())
                .coverImage(req.coverImage())
                .aiPlanSnapshot(req.aiPlanSnapshot())
                .build();
        return TripDetailResponse.from(tripRepository.save(trip));
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
