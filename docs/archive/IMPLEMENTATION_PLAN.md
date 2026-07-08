# CourseKok 백엔드-프론트 연동 구현 계획

> 기준일: 2026-06-24  
> 목표: 내 여행(Trip) + TripLog(여행기) 를 실제 DB/API로 전환. AI 플래너는 mock 유지.

---

## 핵심 원칙

- AI 플래너 응답은 계속 mock (실제 AI 연동은 별도 작업)
- AI 플랜 결과는 JSON 스냅샷으로 `trips.ai_plan_snapshot` 에 저장
- 이미지는 Data URL 그대로 DB TEXT에 저장 (S3 연동은 P1)
- `trip_places` 테이블은 이번 MVP에서 사용 안 함 (스냅샷으로 대체)
- `trip_place_logs.place_id` 는 NULL 허용으로 변경 (migration 필요)

---

## ✅ 완료된 작업

### Phase 1 — DB 마이그레이션 SQL
- [x] `Database/migration_v2.sql` 작성 완료
  - trips 테이블: +cover_image, +region, +period, +style, +ai_plan_snapshot
  - trip_logs 테이블: +cover_image, +mood
  - trip_place_logs: +place_title, +place_category, +place_image, +rating, place_id NULL 허용

### Phase 2 — 백엔드 Entity
- [x] `entity/Trip.java` — ai_plan_snapshot, cover_image, region, period, style 포함
- [x] `entity/TripLog.java` — cover_image, mood, placeLogs 관계 포함
- [x] `entity/TripPlaceLog.java` — place_id nullable, place_title/category/image/rating 스냅샷
- [x] `entity/TripLogLike.java` — unique (trip_log_id, user_id)
- [x] `entity/TripLogBookmark.java` — unique (trip_log_id, user_id)
- [x] `entity/TripLogComment.java`

### Phase 3 — 백엔드 Repository
- [x] `repository/TripRepository.java`
- [x] `repository/TripLogRepository.java` — filter별 쿼리 포함
- [x] `repository/TripPlaceLogRepository.java`
- [x] `repository/TripLogLikeRepository.java`
- [x] `repository/TripLogBookmarkRepository.java`
- [x] `repository/TripLogCommentRepository.java`

### Phase 4 — 백엔드 DTO / Service / Controller
- [x] `dto/trip/TripSaveRequest.java` (신규 — AI 플랜 저장용)
- [x] `dto/trip/TripSummaryResponse.java` (재작성 — region/period/style/coverImage)
- [x] `dto/trip/TripDetailResponse.java` (재작성 — aiPlanSnapshot 포함)
- [x] `dto/triplog/TripLogCreateRequest.java` (신규 — coverImage, mood, placeLogs)
- [x] `dto/triplog/TripLogSummaryResponse.java` (재작성 — liked/bookmarked/coverImage)
- [x] `dto/triplog/TripLogDetailResponse.java` (재작성 — liked/bookmarked 포함)
- [x] `dto/triplog/TripPlaceLogRequest.java` (재작성 — placeTitle/category/image/rating)
- [x] `dto/triplog/TripPlaceLogResponse.java` (재작성 — 스냅샷 우선, DB fallback)
- [x] `dto/triplog/TripLogCommentRequest.java` (재작성)
- [x] `dto/triplog/TripLogCommentResponse.java` (재작성 — isMine 포함)
- [x] `service/TripService.java` — 목록/저장/상세/삭제
- [x] `service/TripLogService.java` — 피드/발행/수정/삭제/좋아요/북마크/댓글
- [x] `controller/TripController.java` (mock → real)
- [x] `controller/TripLogController.java` (mock → real)
- [x] `config/SecurityConfig.java` — GET /api/trip-logs, /api/trip-logs/*/comments 공개 허용
- [x] `exception/GlobalExceptionHandler.java` — NoSuchElementException → 404

### Phase 5 — 프론트엔드 API 레이어
- [x] `src/api/trip.js` — getMyTrips, saveTrip, getTripDetail, deleteTrip
- [x] `src/api/triplog.js` — getFeed, create, detail, update, delete, like, bookmark, comment CRUD

### Phase 6 — 프론트엔드 Pinia 스토어
- [x] `src/stores/trips.js` — fetchTrips, saveTrip, getTripDetail, deleteTrip
- [x] `src/stores/triplog.js` — loadFeed, loadMore, loadDetail, publish, toggleLike, toggleBookmark, comment CRUD

---

### Phase 7 — View 연동 (완료)

#### 7-1. AppLayout.vue ✅
- `savedTrips` → `computed(() => tripsStore.trips)`
- `savePlan` → `async` + `tripsStore.saveTrip(plan)` 반환
- `publishedTripLogs`, `publishTripLog` provide 제거 (각 뷰에서 직접 스토어 호출)

#### 7-2. AIPlannerView.vue ✅
- `handleSavePlan` → async/await + try/catch 에러 처리

#### 7-3. MyTripsView.vue ✅
- `useTripsStore`, `useTripLogStore` 직접 사용
- `onMounted` → `tripsStore.fetchTrips()`
- `openTrip` → async, `getTripDetail(id)` 로 aiPlanSnapshot 포함 상세 조회
- `publishTripLog` → `tripLogStore.publish({tripId, title, content, region, travelStyle, ...})`

#### 7-4. TripLogView.vue ✅
- `tripLogStore.feed` 기반 피드 + `normalizeTripLog()` 필드 정규화
- `onMounted` → `tripLogStore.loadFeed('recent')`
- 필터 칩 → `selectFilter()` + API 필터 매핑 (recent/popular/photo/route)
- `toggleLike` → `tripLogStore.toggleLike(id)`
- `openTripLog` → `tripLogStore.loadDetail(id)` + `loadComments(id)`
- `submitComment` → `tripLogStore.addComment(id, text)`

---

## 실행 순서 (다음 세션 시작 전)

1. **DB 마이그레이션 실행** (한 번만):
   ```bash
   mysql -u root -p travel_db < "Database/migration_v2.sql"
   ```

2. **백엔드 재시작**:
   ```bash
   cd backend/CourseKok
   ./mvnw spring-boot:run
   ```

3. **프론트 재시작**:
   ```bash
   cd frontend
   npm run dev
   ```

4. Phase 7 뷰 연동 작업 시작

---

## API 설계 요약

### Trip (내 여행)
| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | /api/trips | 필요 | 내 여행 목록 |
| POST | /api/trips | 필요 | AI 플랜 저장 |
| GET | /api/trips/{id} | 필요 | 여행 상세 (aiPlanSnapshot 포함) |
| DELETE | /api/trips/{id} | 필요 | 여행 삭제 |

### TripLog (여행기)
| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | /api/trip-logs?filter=recent | 불필요 | 공개 피드 |
| POST | /api/trip-logs | 필요 | 여행기 발행 |
| GET | /api/trip-logs/{id} | 선택 | 상세 (liked/bookmarked 포함) |
| PUT | /api/trip-logs/{id} | 필요 | 수정 |
| DELETE | /api/trip-logs/{id} | 필요 | 삭제 |
| POST/DELETE | /api/trip-logs/{id}/likes | 필요 | 좋아요 토글 |
| POST/DELETE | /api/trip-logs/{id}/bookmarks | 필요 | 북마크 토글 |
| GET | /api/trip-logs/{id}/comments | 불필요 | 댓글 목록 |
| POST | /api/trip-logs/{id}/comments | 필요 | 댓글 작성 |
| DELETE | /api/trip-logs/{id}/comments/{cid} | 필요 | 댓글 삭제 |

### 피드 필터 파라미터
| filter 값 | 정렬 기준 |
|-----------|----------|
| recent (기본) | 최신순 |
| popular | 좋아요 많은순 |
| photo | 장소 기록 많은순 |
| route | 스크랩 많은순 |

---

## 파일 위치 빠른 참조

```
backend/.../entity/        Trip, TripLog, TripPlaceLog, TripLogLike, TripLogBookmark, TripLogComment
backend/.../repository/    TripRepository, TripLogRepository, TripPlaceLogRepository, 
                           TripLogLikeRepository, TripLogBookmarkRepository, TripLogCommentRepository
backend/.../service/       TripService, TripLogService
backend/.../controller/    TripController, TripLogController (mock 제거, 실서비스)
backend/.../dto/trip/      TripSaveRequest, TripSummaryResponse, TripDetailResponse
backend/.../dto/triplog/   TripLogCreateRequest, TripLogSummaryResponse, TripLogDetailResponse,
                           TripPlaceLogRequest, TripPlaceLogResponse, 
                           TripLogCommentRequest, TripLogCommentResponse

frontend/src/api/          trip.js, triplog.js
frontend/src/stores/       trips.js, triplog.js
frontend/src/views/        MyTripsView.vue, TripLogView.vue (Phase 7 미완)
frontend/src/layouts/      AppLayout.vue (Phase 7 미완)
```
