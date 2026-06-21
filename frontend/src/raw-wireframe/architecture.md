# 1. `app.html` 물리적 파일 내 주요 레이아웃 구조 (목차)

`app.html` 원본 파일은 패키징된 리소스 데이터가 대부분의 용량을 차지하며, 레이아웃을 구성하는 템플릿과 컴포넌트 스크립트들이 특정 라인에 몰려 있습니다.

| 라인 번호 | 구성 요소 / ID / Class | 역할 및 설명 |
| --- | --- | --- |
| L 21 ~ 39 | <body> 시작 및 로딩 화면 | 언팩 전 초기 로딩 바 및 썸네일 노출 (#__bundler_thumbnail, #__bundler_loading) |
| L 41 ~ 168 | 언팩 스크립트 (`<script>`) | 브라우저 실행 시 하단의 manifest와 template을 디코딩하여 화면에 주입하는 언팩 엔진 |
| L 171 | `<script type="__bundler/manifest">` | **[핵심 - 526만 자]** 모든 컴포넌트 코드 및 에셋(Base64 + Gzip)이 직렬화되어 있는 메타데이터 저장소 |
| L 175 | `<script type="__bundler/ext_resources">` | 외부 이미지 리소스 매핑 데이터 |
| L 179 | `<script type="__bundler/template">` | 실제 브라우저에 마운트될 기본 DOM 스켈레톤 템플릿 (CSS 토큰 및 마운트 타겟 존재) |
# 2. 해독된 HTML 템플릿 구조 (`L 179` 템플릿 내부)

번들러가 풀어서 브라우저에 렌더링하는 실제 HTML 템플릿의 레이아웃 구조입니다. (총 440라인)

- **L 1 ~ 394**: 전역 디자인 시스템 토큰(CSS Variables), Typography, Motion 및 Reset 스타일 정의
- **L 421 ~ 422**: **최상위 컨테이너** `<div id="kk-root"></div>` (React 앱이 마운트되는 최상위 레이아웃)
- **L 423 ~ 436**: 화면의 각 서브 섹션(Header, Main Content, Sidebar 등) 역할을 담당하는 React 컴포넌트 스크립트 로드

# 3. 주요 서브 섹션 및 레이아웃 컴포넌트 요약

각 화면(View)의 최상위 레이아웃 및 주요 서브 섹션은 `kk-root` 내부에서 `App.jsx` 라우터에 의해 분기 처리 및 렌더링됩니다.

템플릿 라인	| 연동 컴포넌트	| 최상위 ID / Class 및 역할
| --- | --- | --- |
| **L 427**	| **Shell (NavBar)**	| `<div class="ds-navbar">` (상단 헤더 네비게이션 바, 장바구니 Drawer, 알림 토스터)
| **L 428**	| **Explore (탐색)**	| `<div class="explore-page">` (메인 콘텐츠: 여행지 탐색, 탭, 지역 필터 칩)
| **L 430**	| **AI Planner (일정 생성)**	| `<div class="planner-layout">` (메인 콘텐츠: AI 일정 수립 UI, 사이드바 형태의 타임라인, 벡터 지도)
| **L 432**	| **My Trips (내 여행)**	| `<div class="my-trips-page">` (메인 콘텐츠: 편집 가능 코스 목록, 다이어리 기록 블록)
| **L 433**	| **Today's Trip (오늘의 여행)**	| `<div class="today-trip-layout">` (메인 콘텐츠: 당일 동행 체크인 및 앨범 자동 생성 뷰)
| **L 434**	| **TripLog (커뮤니티 피드)**	| `<div class="triplog-feed">` (메인 콘텐츠: 유저 간 여행기 공유 피드, 댓글창)
| **L 429**	| **PlaceDetail Overlay**	| `<div class="place-detail-overlay">` (상세 정보 팝업창 슬라이드)
| **L 435**	| **Onboarding**	| `<div class="onboarding-flow">` (초기 진입 시의 온보딩/회원가입 슬라이드)
| **L 436**	| **App Router & State**	| **최상위 상태 컨트롤러** (전체 화면의 뷰 전환 및 바구니 데이터 관리)