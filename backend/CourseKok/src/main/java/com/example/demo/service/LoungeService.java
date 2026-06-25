package com.example.demo.service;

import com.example.demo.dto.common.PageResponse;
import com.example.demo.dto.lounge.*;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LoungeService {

    private final LoungeSpotRepository spotRepository;
    private final LoungeReviewRepository reviewRepository;
    private final PlaceRepository placeRepository;
    private final UserRepository userRepository;

    // ── 현재 로그인 사용자 ────────────────────────────────────────────────
    private Optional<User> currentUserOpt() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return Optional.empty();
        }
        return userRepository.findByEmail(auth.getName());
    }

    private User currentUser() {
        return currentUserOpt()
                .orElseThrow(() -> new NoSuchElementException("로그인이 필요합니다."));
    }

    // ── 스팟 목록 (공개용) ────────────────────────────────────────────────
    public PageResponse<LoungeSpotSummaryResponse> getSpots(String badge, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<LoungeSpot> result;

        if (badge != null && !badge.isBlank()) {
            LoungeSpot.Badge badgeEnum = LoungeSpot.Badge.valueOf(badge.toUpperCase());
            result = spotRepository.findByIsActiveTrueAndBadgeOrderByDisplayOrderAscCreatedAtDesc(badgeEnum, pageable);
        } else {
            result = spotRepository.findByIsActiveTrueOrderByDisplayOrderAscCreatedAtDesc(pageable);
        }

        List<LoungeSpotSummaryResponse> content = result.getContent().stream()
                .map(LoungeSpotSummaryResponse::from)
                .toList();

        return new PageResponse<>(content, page, size,
                result.getTotalElements(), result.getTotalPages(), result.isLast());
    }

    // ── 스팟 상세 ─────────────────────────────────────────────────────────
    public LoungeSpotDetailResponse getSpotDetail(Long spotId, int reviewPage, int reviewSize) {
        LoungeSpot spot = spotRepository.findById(spotId)
                .orElseThrow(() -> new NoSuchElementException("라운지 스팟을 찾을 수 없습니다."));

        Optional<User> viewer = currentUserOpt();
        boolean myReviewExists = viewer
                .map(u -> reviewRepository.existsByLoungeSpotIdAndUserId(spotId, u.getId()))
                .orElse(false);

        PageResponse<LoungeReviewResponse> reviews = getReviews(spotId, reviewPage, reviewSize);

        return LoungeSpotDetailResponse.from(spot, myReviewExists, reviews);
    }

    // ── 관리자: 스팟 추가 ─────────────────────────────────────────────────
    @Transactional
    public LoungeSpotSummaryResponse createSpot(LoungeSpotCreateRequest req) {
        User admin = currentUser();
        if (admin.getRole() != User.Role.ADMIN) {
            throw new IllegalStateException("관리자만 라운지 스팟을 추가할 수 있습니다.");
        }

        Place place = placeRepository.findById(req.placeId())
                .orElseThrow(() -> new NoSuchElementException("장소를 찾을 수 없습니다."));

        LoungeSpot spot = LoungeSpot.builder()
                .place(place)
                .curatedBy(admin)
                .badge(req.badge())
                .curatorNote(req.curatorNote())
                .displayOrder(req.displayOrder())
                .isActive(req.isActive())
                .build();

        return LoungeSpotSummaryResponse.from(spotRepository.save(spot));
    }

    // ── 관리자: 스팟 수정 ─────────────────────────────────────────────────
    @Transactional
    public LoungeSpotSummaryResponse updateSpot(Long spotId, LoungeSpotCreateRequest req) {
        User admin = currentUser();
        if (admin.getRole() != User.Role.ADMIN) {
            throw new IllegalStateException("관리자만 라운지 스팟을 수정할 수 있습니다.");
        }

        LoungeSpot spot = spotRepository.findById(spotId)
                .orElseThrow(() -> new NoSuchElementException("라운지 스팟을 찾을 수 없습니다."));

        spot.update(req.badge(), req.curatorNote(), req.displayOrder(), req.isActive());
        return LoungeSpotSummaryResponse.from(spot);
    }

    // ── 관리자: 스팟 삭제 ─────────────────────────────────────────────────
    @Transactional
    public void deleteSpot(Long spotId) {
        User admin = currentUser();
        if (admin.getRole() != User.Role.ADMIN) {
            throw new IllegalStateException("관리자만 라운지 스팟을 삭제할 수 있습니다.");
        }

        LoungeSpot spot = spotRepository.findById(spotId)
                .orElseThrow(() -> new NoSuchElementException("라운지 스팟을 찾을 수 없습니다."));

        spotRepository.delete(spot);
    }

    // ── 리뷰 목록 ─────────────────────────────────────────────────────────
    public PageResponse<LoungeReviewResponse> getReviews(Long spotId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<LoungeReview> result = reviewRepository.findByLoungeSpotIdOrderByCreatedAtDesc(spotId, pageable);

        List<LoungeReviewResponse> content = result.getContent().stream()
                .map(LoungeReviewResponse::from)
                .toList();

        return new PageResponse<>(content, page, size,
                result.getTotalElements(), result.getTotalPages(), result.isLast());
    }

    // ── 리뷰 작성 ─────────────────────────────────────────────────────────
    @Transactional
    public LoungeReviewResponse createReview(Long spotId, LoungeReviewRequest req) {
        User user = currentUser();

        LoungeSpot spot = spotRepository.findById(spotId)
                .orElseThrow(() -> new NoSuchElementException("라운지 스팟을 찾을 수 없습니다."));

        if (reviewRepository.existsByLoungeSpotIdAndUserId(spotId, user.getId())) {
            throw new IllegalStateException("이미 리뷰를 작성하셨습니다. 수정 기능을 이용해주세요.");
        }

        LoungeReview review = LoungeReview.builder()
                .loungeSpot(spot)
                .user(user)
                .rating(req.rating())
                .content(req.content())
                .build();

        LoungeReview saved = reviewRepository.save(review);
        recalculateSpotStats(spot);

        return LoungeReviewResponse.from(saved);
    }

    // ── 리뷰 수정 ─────────────────────────────────────────────────────────
    @Transactional
    public LoungeReviewResponse updateReview(Long spotId, Long reviewId, LoungeReviewRequest req) {
        User user = currentUser();

        LoungeReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NoSuchElementException("리뷰를 찾을 수 없습니다."));

        if (!review.getLoungeSpot().getId().equals(spotId)) {
            throw new IllegalArgumentException("해당 스팟의 리뷰가 아닙니다.");
        }
        if (!review.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("본인의 리뷰만 수정할 수 있습니다.");
        }

        review.update(req.rating(), req.content());

        LoungeSpot spot = spotRepository.findById(spotId).orElseThrow();
        recalculateSpotStats(spot);

        return LoungeReviewResponse.from(review);
    }

    // ── 리뷰 삭제 ─────────────────────────────────────────────────────────
    @Transactional
    public void deleteReview(Long spotId, Long reviewId) {
        User user = currentUser();

        LoungeReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NoSuchElementException("리뷰를 찾을 수 없습니다."));

        if (!review.getLoungeSpot().getId().equals(spotId)) {
            throw new IllegalArgumentException("해당 스팟의 리뷰가 아닙니다.");
        }

        boolean isOwner = review.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new IllegalStateException("본인의 리뷰만 삭제할 수 있습니다.");
        }

        reviewRepository.delete(review);

        LoungeSpot spot = spotRepository.findById(spotId).orElseThrow();
        recalculateSpotStats(spot);
    }

    // ── 스팟 통계 재계산 ─────────────────────────────────────────────────
    private void recalculateSpotStats(LoungeSpot spot) {
        long count = reviewRepository.countByLoungeSpotId(spot.getId());
        double avg = reviewRepository.findAverageRatingBySpotId(spot.getId());
        spot.recalculateStats((int) count, avg);
    }
}
