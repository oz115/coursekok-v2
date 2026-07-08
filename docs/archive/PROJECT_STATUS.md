# CourseKok 프로젝트 현황 문서

> 마지막 업데이트: 2026-06-23  
> 이 파일은 Claude가 매 세션 시작 시 프로젝트 상태를 빠르게 파악하기 위한 문서입니다.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 서비스명 | 코스콕 (CourseKok) |
| 목표 | 한국관광공사 API 기반 여행지 탐색 → 장소 저장 → AI 일정 생성 → 여행 기록(TripLog) 공유 |
| 프론트 | Vue 3 + TypeScript + Pinia + Vue Router + Vite (port 5173) |
| 백엔드 | Spring Boot 4.0.6 + JPA + MyBatis + Spring Security + JWT (port 8080) |
| DB | MySQL |
| 외부 API | 한국관광공사 TourAPI |

---

## 2. 디렉토리 구조 (핵심 파일만)

```
coursekok/
├── PROJECT_STATUS.md          ← 이 파일
├── frontend/
│   └── src/
│       ├── main.ts            ← Vue 앱 진입점 (Pinia, Router 등록)
│       ├── App.vue            ← 루트 컴포넌트
│       ├── router/
│       │   └── index.ts       ← 라우터 + 네비게이션 가드
│       ├── stores/
│       │   └── auth.js        ← Pinia 인증 스토어 (login/signup/logout/bootstrap)
│       ├── api/
│       │   ├── http.js        ← fetch 기반 HTTP 클라이언트 (401 자동 토큰 갱신)
│       │   └── auth.js        ← 인증 API 함수 (signup/login/logout/me/refresh)
│       ├── layouts/
│       │   └── AppLayout.vue  ← 앱 최상위 레이아웃 (인증 분기 처리 포함)
│       └── views/
│           ├── OnboardingView.vue  ← 온보딩 4단계 + 회원가입/로그인 폼
│           ├── ExploreView.vue     ← 여행지 탐색
│           ├── AIPlannerView.vue   ← AI 코스 생성
│           ├── MyTripsView.vue     ← 내 여행 목록
│           └── TodayTripView.vue   ← 오늘의 여행
│
└── backend/CourseKok/src/main/java/com/example/demo/
    ├── config/
    │   ├── SecurityConfig.java    ← Spring Security 설정 (CORS, JWT 필터, 공개/인증 경로)
    │   ├── CorsConfig.java        ← MVC CORS 설정 (localhost:5173 허용)
    │   └── SwaggerConfig.java     ← Swagger Bearer 인증 설정
    ├── security/
    │   └── JwtAuthFilter.java     ← 요청마다 Bearer 토큰 검증 → SecurityContext 등록
    ├── controller/
    │   ├── AuthController.java    ← /api/auth/* (signup/login/refresh/me/logout)
    │   ├── PlaceController.java   ← /api/places/* (Mock)
    │   ├── TripController.java    ← /api/trips/* (Mock)
    │   ├── TripLogController.java ← /api/trip-logs/* (Mock)
    │   ├── SavedPlaceController.java ← /api/saved-places/* (Mock)
    │   └── AdminController.java   ← /api/admin/* (Mock)
    ├── service/
    │   ├── AuthService.java       ← 회원가입/로그인/refresh/logout 실제 로직
    │   └── TourApiClient.java     ← 한국관광공사 API WebClient
    ├── entity/
    │   ├── User.java              ← 사용자 엔티티
    │   ├── RefreshToken.java      ← 리프레시 토큰 엔티티
    │   ├── Place.java             ← 관광지 엔티티 (JPA)
    │   └── RegionCode.java        ← 지역코드 엔티티
    ├── repository/
    │   ├── UserRepository.java
    │   ├── RefreshTokenRepository.java
    │   ├── PlaceRepository.java
    │   └── RegionCodeRepository.java
    ├── util/
    │   └── JwtUtil.java           ← JWT 발급/검증 (HMAC-SHA256)
    ├── exception/
    │   └── GlobalExceptionHandler.java ← 에러 응답 {"message":"..."} 통일
    └── dto/
        ├── auth/    ← LoginRequest, LoginResponse, SignUpRequest, UserResponse, UpdateProfileRequest
        ├── place/   ← PlaceResponse, PlaceSummaryResponse, PlaceSearchRequest
        ├── trip/    ← TripRequest, TripDetailResponse, TripSummaryResponse ...
        ├── triplog/ ← TripLogRequest, TripLogDetailResponse ...
        └── common/  ← PageResponse
```

---

## 3. 인증 흐름 (Access Token + Refresh Token)

```
[최초 방문]
  → AppLayout.vue의 onMounted에서 auth.bootstrap() 호출
  → /api/auth/refresh 시도 (httpOnly 쿠키 자동 전송)
  → 쿠키 없으면 실패 → clearSession() → OnboardingView 표시

[회원가입]
  온보딩 4단계 슬라이드 → 회원가입 폼
  → POST /api/auth/signup (201 Created)
  → 자동으로 POST /api/auth/login 호출
  → accessToken 응답 body, refreshToken httpOnly Cookie 설정
  → Pinia에 accessToken + user 저장 → 앱 진입

[로그인]
  → POST /api/auth/login
  → accessToken (body) → Pinia 메모리 저장
  → refreshToken (httpOnly Cookie, path=/api/auth, 14일)

[API 요청]
  → http.js가 Authorization: Bearer {accessToken} 헤더 자동 추가

[토큰 만료 (401)]
  → http.js 인터셉터가 자동으로 POST /api/auth/refresh 호출
  → 새 accessToken 발급 + refreshToken Rotate (기존 삭제, 신규 발급)
  → 원본 요청 재시도

[refresh도 실패]
  → clearSession() → OnboardingView로 돌아감

[로그아웃]
  → POST /api/auth/logout → DB에서 refreshToken 삭제 + 쿠키 삭제
  → Pinia clearSession() → OnboardingView 표시
```

---

## 4. 구현 완료 항목

### 백엔드

| 항목 | 파일 | 상태 |
|---|---|---|
| Spring Security 설정 | SecurityConfig.java | ✅ 완료 |
| JWT 발급/검증 | JwtUtil.java | ✅ 완료 |
| JWT 필터 | JwtAuthFilter.java | ✅ 완료 |
| User 엔티티 + Repository | User.java, UserRepository.java | ✅ 완료 |
| RefreshToken 엔티티 + Repository | RefreshToken.java, RefreshTokenRepository.java | ✅ 완료 |
| 회원가입 API | POST /api/auth/signup | ✅ 완료 |
| 로그인 API | POST /api/auth/login | ✅ 완료 |
| 토큰 갱신 API | POST /api/auth/refresh | ✅ 완료 |
| 로그아웃 API | POST /api/auth/logout | ✅ 완료 |
| 내 프로필 조회 | GET /api/auth/me | ✅ 완료 |
| 내 프로필 수정 | PUT /api/auth/me | ✅ 완료 |
| 에러 응답 통일 | GlobalExceptionHandler.java | ✅ 완료 |
| CORS 설정 | SecurityConfig.java + CorsConfig.java | ✅ 완료 |
| 여행지 API | PlaceController.java | ⚠️ Mock만 |
| 저장 장소 API | SavedPlaceController.java | ⚠️ Mock만 |
| 여행 계획 API | TripController.java | ⚠️ Mock만 |
| TripLog API | TripLogController.java | ⚠️ Mock만 |
| 관리자 API | AdminController.java | ⚠️ Mock만 |

### 프론트엔드

| 항목 | 파일 | 상태 |
|---|---|---|
| 온보딩 4단계 슬라이드 | OnboardingView.vue | ✅ 완료 |
| 회원가입/로그인 폼 | OnboardingView.vue | ✅ 완료 |
| Pinia 인증 스토어 | stores/auth.js | ✅ 완료 |
| HTTP 클라이언트 (401 인터셉터) | api/http.js | ✅ 완료 |
| 앱 레이아웃 (인증 분기) | AppLayout.vue | ✅ 완료 |
| 라우터 네비게이션 가드 | router/index.ts | ✅ 완료 |
| 여행지 탐색 화면 | ExploreView.vue | ⚠️ Mock 데이터 |
| AI 플래너 화면 | AIPlannerView.vue | ⚠️ Mock 데이터 |
| 내 여행 화면 | MyTripsView.vue | ⚠️ Mock 데이터 |
| 오늘의 여행 화면 | TodayTripView.vue | ⚠️ Mock 데이터 |

---

## 5. 남은 작업 (WBS 기준)

### 우선순위: 필수

| # | 기능 | 백엔드 | 프론트 |
|---|---|---|---|
| 1 | TourAPI 여행지 목록/상세 연동 | PlaceController 실제 구현 | ExploreView API 연결 |
| 2 | 카테고리/지역 필터링 | 필터 쿼리 파라미터 처리 | 필터 UI 동작 |
| 3 | 장소 저장 (찜) | SavedPlaceController 실제 구현 | 저장 버튼 연동 |
| 4 | AI 일정 생성 | AIPlannerView → LLM API 연결 | AI 결과 화면 |
| 5 | 여행 계획 저장/조회/수정 | TripController 실제 구현 | MyTripsView 연동 |
| 6 | 마이페이지 | 내 여행, 내 TripLog API | 마이페이지 화면 |
| 7 | TripLog 목록/작성/상세 | TripLogController 실제 구현 | TripLog 화면 |
| 8 | 코스 내 계획으로 복사 | 코스 복사 API | 복사 UI |

### 우선순위: 선택

| # | 기능 | 비고 |
|---|---|---|
| 9 | 좋아요 / 북마크 | TripLog 반응 기능 |
| 10 | 댓글 | TripLog 댓글 |
| 11 | 인기 여행지/인기 코스 | 저장 수, TripLog 등장 수 기반 |
| 12 | 공지사항 | 관리자 기능 |
| 13 | 관리자 대시보드 | 회원/게시글 관리 |

---

## 6. 환경 설정 및 실행 방법

### 6.1 필수 환경변수

백엔드 실행 전 아래 환경변수를 설정해야 합니다.

```bash
# DB 연결 (MySQL)
DB_URL=jdbc:mysql://localhost:3306/coursekok?useSSL=false&allowPublicKeyRetrieval=true&characterEncoding=UTF-8
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

# JWT 시크릿 (없으면 기본값 사용, 프로덕션에서는 반드시 설정)
JWT_SECRET=your-very-long-secure-secret-key-at-least-32-chars

# 한국관광공사 TourAPI 키 (여행지 조회 기능에 필요)
TOUR_API_KEY=your_tour_api_key
```

Windows에서 환경변수 설정 (IntelliJ Run Configuration에서 설정 권장):
```
Edit Configurations → Environment variables에 위 값 입력
```

### 6.2 DB 테이블 생성

`application.properties`에 `spring.jpa.hibernate.ddl-auto=update`로 설정되어 있어서,
백엔드 서버 최초 기동 시 아래 테이블이 자동 생성됩니다:
- `users`
- `refresh_tokens`
- `places` (기존)
- `region_codes` (기존)

### 6.3 백엔드 실행

```bash
cd backend/CourseKok
./mvnw spring-boot:run
# 또는 IntelliJ에서 CourseKokApplication.java 실행
```

실행 확인: http://localhost:8080/swagger-ui/index.html

### 6.4 프론트엔드 실행

백엔드 서버가 켜진 상태에서 프론트를 실행해야 합니다.

```bash
cd frontend
npm install   # 최초 1회만
npm run dev
```

실행 확인: http://localhost:5173

> ⚠️ 반드시 백엔드(8080)를 먼저 켜고, 그 다음 프론트(5173)를 켜야 정상 동작합니다.

### 6.5 프론트엔드 환경변수 (선택)

`frontend/.env` 파일 생성 (없으면 빈 문자열 → 상대경로 사용):
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

> 현재 `api/auth.js`는 `/auth/signup` 처럼 상대경로를 사용합니다.  
> `VITE_API_BASE_URL`을 설정하면 `http://localhost:8080/api/auth/signup`으로 요청됩니다.

---

## 7. 주요 API 엔드포인트

| Method | URL | 인증 필요 | 설명 |
|---|---|---|---|
| POST | /api/auth/signup | ❌ | 회원가입 |
| POST | /api/auth/login | ❌ | 로그인 (accessToken 반환, refreshToken 쿠키 설정) |
| POST | /api/auth/refresh | ❌ | 토큰 갱신 (쿠키의 refreshToken 사용) |
| GET | /api/auth/me | ✅ Bearer | 내 프로필 조회 |
| PUT | /api/auth/me | ✅ Bearer | 내 프로필 수정 |
| POST | /api/auth/logout | ✅ Bearer | 로그아웃 |
| GET | /api/places | ✅ Bearer | 여행지 목록 (현재 Mock) |
| GET | /api/places/{id} | ✅ Bearer | 여행지 상세 (현재 Mock) |
| GET/POST/DELETE | /api/saved-places | ✅ Bearer | 장소 저장 (현재 Mock) |
| GET/POST/PUT/DELETE | /api/trips | ✅ Bearer | 여행 계획 (현재 Mock) |
| GET/POST | /api/trip-logs | ✅ Bearer | TripLog (현재 Mock) |

Swagger UI: http://localhost:8080/swagger-ui/index.html

---

## 8. 화면 흐름

```
앱 최초 접속 (/app)
    │
    ├─ 인증 초기화 중 → "코스콕을 준비하는 중..." 로딩 화면
    │
    ├─ 미인증 → OnboardingView
    │     ├─ STEP 1~4: 서비스 소개 슬라이드 (건너뛰기 가능)
    │     └─ 회원가입 / 로그인 폼
    │           └─ 성공 → 앱 진입
    │
    └─ 인증됨 → AppLayout
          ├─ NavBar (여행지 탐색 / AI 플래너 / 내 여행 / 오늘의 여행)
          ├─ 여행 바구니 서랍 (담은 장소 목록)
          └─ 현재 활성 뷰 렌더링
                ├─ ExploreView    ← 여행지 탐색
                ├─ AIPlannerView  ← AI 코스 생성
                ├─ MyTripsView    ← 내 여행 목록
                └─ TodayTripView  ← 오늘의 여행
```

---

## 9. 컴포넌트 구조 요약

```
frontend/src/components/
├── core/          ← Button, Badge
├── forms/         ← Input, Select, Textarea, Checkbox, Switch
├── data-display/  ← Card, PlaceCard, Avatar, Rating, IconButton, FilterChip
├── navigation/    ← Tabs, SegmentedControl
├── feedback/      ← Stepper, Toast
├── brand/         ← Mascot (콕이), MascotBubble
├── domain/        ← CourseMap (지도), PlaceDetailOverlay, JournalBlock
└── icons/         ← 73개 SVG 아이콘 (KkIcon 래퍼로 통합 사용)
```

---

## 10. 세션 간 기억할 주요 사항

- `stores/auth.js`와 `api/` 파일들은 **JavaScript (.js)**로 작성됨 (TypeScript 아님)
- refreshToken은 **httpOnly Cookie**로 관리 → 프론트에서 직접 접근 불가
- accessToken은 **Pinia 메모리**에만 저장 → 새로고침 시 자동으로 refresh 엔드포인트 호출
- AppLayout의 `v-else-if="!auth.isAuthenticated"` 조건이 인증 가드 역할 (라우터 가드는 bootstrap 대기용)
- Mock 데이터는 `frontend/src/data/mockData.js`에 있음
- TourAPI 응답 파싱 로직은 `TourApiClient.java`에 있음 (실제 연동 미완성)
- `ddl-auto=update` — 로컬 개발용, 운영 환경에서는 `validate`로 변경 필요
