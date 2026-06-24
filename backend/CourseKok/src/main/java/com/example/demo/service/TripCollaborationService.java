package com.example.demo.service;

import com.example.demo.dto.trip.collaboration.SharedTripResponse;
import com.example.demo.dto.trip.collaboration.TripCommentRequest;
import com.example.demo.dto.trip.collaboration.TripCommentResponse;
import com.example.demo.entity.Trip;
import com.example.demo.entity.TripCollaborationComment;
import com.example.demo.entity.TripShare;
import com.example.demo.entity.User;
import com.example.demo.repository.TripCollaborationCommentRepository;
import com.example.demo.repository.TripRepository;
import com.example.demo.repository.TripShareRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TripCollaborationService {

    private final TripRepository tripRepository;
    private final TripShareRepository tripShareRepository;
    private final TripCollaborationCommentRepository commentRepository;
    private final UserRepository userRepository;

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));
    }

    @Transactional
    public SharedTripResponse createOrGetShare(Long tripId) {
        Trip trip = ownedTrip(tripId);
        TripShare share = tripShareRepository.findByTrip(trip)
                .orElseGet(() -> tripShareRepository.save(
                        TripShare.builder()
                                .trip(trip)
                                .token(UUID.randomUUID().toString().replace("-", ""))
                                .build()
                ));
        return response(share);
    }

    public SharedTripResponse getOwnerShare(Long tripId) {
        Trip trip = ownedTrip(tripId);
        TripShare share = tripShareRepository.findByTrip(trip)
                .orElseThrow(() -> new NoSuchElementException("아직 공유 링크가 없습니다."));
        return response(share);
    }

    public SharedTripResponse getSharedTrip(String token) {
        return response(openShare(token));
    }

    @Transactional
    public TripCommentResponse addComment(String token, TripCommentRequest request) {
        TripShare share = openShare(token);
        TripCollaborationComment comment = TripCollaborationComment.builder()
                .tripShare(share)
                .targetKey(request.targetKey())
                .nickname(request.nickname().trim())
                .content(request.content().trim())
                .preference(request.preference())
                .build();
        return TripCommentResponse.from(commentRepository.save(comment));
    }

    private Trip ownedTrip(Long tripId) {
        return tripRepository.findByIdAndUser(tripId, currentUser())
                .orElseThrow(() -> new NoSuchElementException("여행을 찾을 수 없습니다."));
    }

    private TripShare openShare(String token) {
        return tripShareRepository.findByTokenAndStatus(token, "OPEN")
                .orElseThrow(() -> new NoSuchElementException("유효하지 않거나 닫힌 공유 링크입니다."));
    }

    private SharedTripResponse response(TripShare share) {
        return SharedTripResponse.from(
                share,
                commentRepository.findByTripShareOrderByCreatedAtAsc(share)
        );
    }
}
