package com.example.demo.service;

import com.example.demo.dto.common.PageResponse;
import com.example.demo.dto.place.PlaceSummaryResponse;
import com.example.demo.dto.trip.TripDayResponse;
import com.example.demo.dto.trip.TripPlaceResponse;
import com.example.demo.dto.triplog.*;
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
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TripLogService {

    private final TripLogRepository tripLogRepository;
    private final TripRepository tripRepository;
    private final TripPlaceLogRepository tripPlaceLogRepository;
    private final TripLogLikeRepository likeRepository;
    private final TripLogBookmarkRepository bookmarkRepository;
    private final TripLogCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final TripDayRepository tripDayRepository;
    private final SavedPlaceRepository savedPlaceRepository;

    // ── 현재 로그인 사용자 (비인증 요청에서는 null) ───────────────────────
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

    // ── 공개 피드 ─────────────────────────────────────────────────────────
    public PageResponse<TripLogSummaryResponse> getFeed(String filter, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TripLog> result = switch (filter) {
            case "popular"  -> tripLogRepository.findByIsPublicTrueOrderByLikeCountDesc(pageable);
            case "photo"    -> tripLogRepository.findByIsPublicTrueOrderByPlaceLogsCountDesc(pageable);
            case "route"    -> tripLogRepository.findByIsPublicTrueOrderByCopyCountDesc(pageable);
            default         -> tripLogRepository.findByIsPublicTrueOrderByCreatedAtDesc(pageable);
        };

        Optional<User> viewer = currentUserOpt();
        List<TripLogSummaryResponse> content = result.getContent().stream()
                .map(log -> {
                    boolean liked = viewer.map(u -> likeRepository.existsByTripLogIdAndUserId(log.getId(), u.getId())).orElse(false);
                    boolean saved = viewer.map(u -> bookmarkRepository.existsByTripLogIdAndUserId(log.getId(), u.getId())).orElse(false);
                    int commentCount = (int) commentRepository.findByTripLogIdOrderByCreatedAtDesc(log.getId(), PageRequest.of(0, 1)).getTotalElements();
                    return TripLogSummaryResponse.from(log, liked, saved, commentCount);
                })
                .toList();

        return new PageResponse<>(content, page, size,
                result.getTotalElements(), result.getTotalPages(), result.isLast());
    }

    // ── 내 여행기 목록 (공개 + 비공개) ───────────────────────────────────
    public List<TripLogSummaryResponse> getMyLogs() {
        User user = currentUser();
        return tripLogRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(log -> {
                    boolean liked = likeRepository.existsByTripLogIdAndUserId(log.getId(), user.getId());
                    boolean bookmarked = bookmarkRepository.existsByTripLogIdAndUserId(log.getId(), user.getId());
                    int commentCount = (int) commentRepository
                            .findByTripLogIdOrderByCreatedAtDesc(log.getId(), PageRequest.of(0, 1))
                            .getTotalElements();
                    return TripLogSummaryResponse.from(log, liked, bookmarked, commentCount);
                })
                .toList();
    }

    // ── 공개 여부 변경 ────────────────────────────────────────────────────
    @Transactional
    public TripLogSummaryResponse updateVisibility(Long id, boolean isPublic) {
        User user = currentUser();
        TripLog log = tripLogRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new NoSuchElementException("여행기를 찾을 수 없거나 권한이 없습니다."));
        log.updateVisibility(isPublic);
        boolean liked = likeRepository.existsByTripLogIdAndUserId(id, user.getId());
        boolean bookmarked = bookmarkRepository.existsByTripLogIdAndUserId(id, user.getId());
        int commentCount = (int) commentRepository
                .findByTripLogIdOrderByCreatedAtDesc(id, PageRequest.of(0, 1)).getTotalElements();
        return TripLogSummaryResponse.from(log, liked, bookmarked, commentCount);
    }

    // ── 여행기 발행 ───────────────────────────────────────────────────────
    @Transactional
    public TripLogDetailResponse createTripLog(TripLogCreateRequest req) {
        User user = currentUser();

        Trip trip = null;
        if (req.tripId() != null) {
            trip = tripRepository.findById(req.tripId()).orElse(null);
        }

        TripLog log = TripLog.builder()
                .user(user)
                .trip(trip)
                .title(req.title())
                .content(req.content())
                .region(req.region())
                .travelStyle(req.travelStyle())
                .isPublic(Boolean.TRUE.equals(req.isPublic()))
                .coverImage(req.coverImage())
                .mood(req.mood())
                .build();

        TripLog saved = tripLogRepository.save(log);

        if (req.placeLogs() != null) {
            for (TripPlaceLogRequest pr : req.placeLogs()) {
                TripPlaceLog placeLog = TripPlaceLog.builder()
                        .tripLog(saved)
                        .placeTitle(pr.placeTitle())
                        .placeCategory(pr.placeCategory())
                        .placeImage(pr.placeImage())
                        .visitOrder(pr.visitOrder())
                        .dayNumber(pr.dayNumber())
                        .reviewContent(pr.reviewContent())
                        .imageUrl(pr.imageUrl())
                        .rating(pr.rating())
                        .build();
                tripPlaceLogRepository.save(placeLog);
            }
        }

        List<TripPlaceLogResponse> placeLogs = tripPlaceLogRepository
                .findByTripLogIdOrderByVisitOrderAsc(saved.getId())
                .stream().map(TripPlaceLogResponse::from).toList();

        return TripLogDetailResponse.from(saved, false, false, placeLogs, List.of());
    }

    // ── 여행기 상세 조회 ──────────────────────────────────────────────────
    @Transactional
    public TripLogDetailResponse getTripLog(Long id) {
        TripLog log = tripLogRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("여행기를 찾을 수 없습니다."));
        log.incrementViewCount();

        Optional<User> viewer = currentUserOpt();
        boolean liked = viewer.map(u -> likeRepository.existsByTripLogIdAndUserId(id, u.getId())).orElse(false);
        boolean saved = viewer.map(u -> bookmarkRepository.existsByTripLogIdAndUserId(id, u.getId())).orElse(false);

        List<TripPlaceLogResponse> placeLogs = log.getPlaceLogs().stream()
                .map(TripPlaceLogResponse::from).toList();

        List<TripDayResponse> tripPlan = buildTripPlan(log.getTrip());

        return TripLogDetailResponse.from(log, liked, saved, placeLogs, tripPlan);
    }

    private List<TripDayResponse> buildTripPlan(Trip trip) {
        if (trip == null) return List.of();
        return tripDayRepository.findByTripOrderByDayNumberAsc(trip).stream()
                .map(day -> new TripDayResponse(
                        day.getId(),
                        day.getDayNumber(),
                        day.getTripDate(),
                        day.getTripPlaces().stream()
                                .sorted(java.util.Comparator.comparingInt(TripPlace::getVisitOrder))
                                .map(tp -> {
                                    Place p = tp.getPlace();
                                    PlaceSummaryResponse placeSummary = new PlaceSummaryResponse(
                                            p.getId(), p.getContentTypeId(), p.getTitle(), p.getAddress(),
                                            p.getRegionCode() != null ? p.getRegionCode().getLdongRegnNm() : null,
                                            p.getRegionCode() != null ? p.getRegionCode().getLdongSignguNm() : null,
                                            p.getMapX(), p.getMapY(), p.getFirstImage(), p.getFirstImage(),
                                            p.getViews(), p.getRating()
                                    );
                                    return new TripPlaceResponse(tp.getId(), placeSummary,
                                            tp.getVisitOrder(), tp.getMemo(), tp.getStartTime(), tp.getEndTime());
                                })
                                .toList()
                ))
                .toList();
    }

    // ── 여행기 수정 ───────────────────────────────────────────────────────
    @Transactional
    public TripLogDetailResponse updateTripLog(Long id, TripLogCreateRequest req) {
        User user = currentUser();
        TripLog log = tripLogRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new NoSuchElementException("여행기를 찾을 수 없거나 권한이 없습니다."));

        log.update(req.title(), req.content(), req.region(), req.travelStyle(),
                Boolean.TRUE.equals(req.isPublic()), req.coverImage(), req.mood());

        List<TripPlaceLogResponse> placeLogs = log.getPlaceLogs().stream()
                .map(TripPlaceLogResponse::from).toList();

        boolean liked = likeRepository.existsByTripLogIdAndUserId(id, user.getId());
        boolean bookmarked = bookmarkRepository.existsByTripLogIdAndUserId(id, user.getId());
        return TripLogDetailResponse.from(log, liked, bookmarked, placeLogs, List.of());
    }

    // ── 여행기 삭제 ───────────────────────────────────────────────────────
    @Transactional
    public void deleteTripLog(Long id) {
        User user = currentUser();
        TripLog log = tripLogRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new NoSuchElementException("여행기를 찾을 수 없거나 권한이 없습니다."));
        tripLogRepository.delete(log);
    }

    // ── 좋아요 토글 ───────────────────────────────────────────────────────
    @Transactional
    public boolean toggleLike(Long tripLogId) {
        User user = currentUser();
        TripLog log = tripLogRepository.findById(tripLogId)
                .orElseThrow(() -> new NoSuchElementException("여행기를 찾을 수 없습니다."));

        Optional<TripLogLike> existing = likeRepository.findByTripLogIdAndUserId(tripLogId, user.getId());
        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            log.decrementLikeCount();
            return false;
        } else {
            likeRepository.save(TripLogLike.builder().tripLog(log).user(user).build());
            log.incrementLikeCount();
            return true;
        }
    }

    // ── 북마크 토글 ───────────────────────────────────────────────────────
    @Transactional
    public Map<String, Object> toggleBookmark(Long tripLogId) {
        User user = currentUser();
        TripLog log = tripLogRepository.findById(tripLogId)
                .orElseThrow(() -> new NoSuchElementException("여행기를 찾을 수 없습니다."));

        Optional<TripLogBookmark> existing = bookmarkRepository.findByTripLogIdAndUserId(tripLogId, user.getId());
        if (existing.isPresent()) {
            bookmarkRepository.delete(existing.get());
            log.decrementCopyCount();
            return Map.of("bookmarked", false, "savedPlaceCount", 0);
        }

        bookmarkRepository.save(TripLogBookmark.builder().tripLog(log).user(user).build());
        log.incrementCopyCount();

        int savedCount = 0;
        if (log.getTrip() != null) {
            List<TripDay> days = tripDayRepository.findByTripOrderByDayNumberAsc(log.getTrip());
            for (TripDay day : days) {
                for (TripPlace tp : day.getTripPlaces()) {
                    Place place = tp.getPlace();
                    if (!savedPlaceRepository.existsByUserAndPlace(user, place)) {
                        savedPlaceRepository.save(SavedPlace.builder().user(user).place(place).build());
                        savedCount++;
                    }
                }
            }
        }
        return Map.of("bookmarked", true, "savedPlaceCount", savedCount);
    }

    // ── 댓글 목록 ─────────────────────────────────────────────────────────
    public PageResponse<TripLogCommentResponse> getComments(Long tripLogId, int page, int size) {
        Optional<User> viewer = currentUserOpt();
        Page<TripLogComment> result = commentRepository
                .findByTripLogIdOrderByCreatedAtDesc(tripLogId, PageRequest.of(page, size));

        List<TripLogCommentResponse> content = result.getContent().stream()
                .map(c -> {
                    boolean isMine = viewer.map(u -> u.getId().equals(c.getUser().getId())).orElse(false);
                    return TripLogCommentResponse.from(c, isMine);
                })
                .toList();

        return new PageResponse<>(content, page, size,
                result.getTotalElements(), result.getTotalPages(), result.isLast());
    }

    // ── 댓글 작성 ─────────────────────────────────────────────────────────
    @Transactional
    public TripLogCommentResponse addComment(Long tripLogId, TripLogCommentRequest req) {
        User user = currentUser();
        TripLog log = tripLogRepository.findById(tripLogId)
                .orElseThrow(() -> new NoSuchElementException("여행기를 찾을 수 없습니다."));

        TripLogComment comment = TripLogComment.builder()
                .tripLog(log).user(user).content(req.content()).build();
        return TripLogCommentResponse.from(commentRepository.save(comment), true);
    }

    // ── 댓글 삭제 ─────────────────────────────────────────────────────────
    @Transactional
    public void deleteComment(Long tripLogId, Long commentId) {
        User user = currentUser();
        TripLogComment comment = commentRepository.findByIdAndUserId(commentId, user.getId())
                .orElseThrow(() -> new NoSuchElementException("댓글을 찾을 수 없거나 권한이 없습니다."));
        commentRepository.delete(comment);
    }
}
