# EnjoyTrip(CourseKok) 데이터베이스 명세서

## 1. 개요 (Overview)
본 문서는 한국관광공사 API(TourAPI) 기반의 여행지 탐색 기능, AI 기술 기반의 일자별 여정 스케줄러 기능, 그리고 장소별 포토 후기를 연동한 매거진 형태의 여행기(TripLog) 공유 커뮤니티 서비스를 지원하기 위한 관계형 데이터베이스(MySQL 8.0+) 스키마 명세서입니다.

### 설계 원칙 (Core Principles)
1. **대리키 전략**: 인덱스 효율 극대화 및 유연한 요구사항 대응을 위해 모든 엔티티에 `BIGINT AUTO_INCREMENT` 단일 대리키를 기본키(PK)로 부여합니다.
2. **생명주기 분리**: 미래의 계획(`trips`)과 과거의 기록(`trip_logs`) 데이터 라이프사이클을 절연하기 위해, 여행지별 상세 리뷰(`trip_place_logs`)는 원본 일정 데이터의 필드를 스냅샷 구조로 복사 복제하여 저장합니다.
3. **정밀도 유지**: 지도 마킹용 위경도 좌표의 부동소수점 오차를 원천 차단하기 위해 `DECIMAL(13, 10)` 타입을 채택합니다.
4. **모던 표준 적용**: MySQL 8.0+ 기준 Display Width 사양 만료(Deprecated) 처리에 따라, 참/거짓 플래그는 `BOOLEAN` 타입으로 통일합니다.

---

## 2. 테이블 상세 명세 (Table Specifications)

### 2.1. users (회원 정보)
* **설명**: 서비스 사용자의 인증 정보, 프로필 메타데이터 및 서비스 이용 권한을 관리합니다.
* **제약조건 및 비고**: `email` 및 `nickname`은 시스템 내에서 유일해야 합니다.

| 컬럼명 | 데이터 타입 | Null | Key | Default | 설명 및 제약조건 |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **id** | BIGINT | N | PK | Auto Inc | 유저 고유 식별자 |
| **email** | VARCHAR(100) | N | UK | - | 로그인용 이메일 계정 (포맷 검증 필요) |
| **password** | VARCHAR(255) | N | - | - | 암호화된 비밀번호 (Bcrypt 인코딩) |
| **nickname** | VARCHAR(50) | N | UK | - | 서비스 내 활동 닉네임 |
| **role** | VARCHAR(20) | N | - | 'USER' | 시스템 권한 등급 (`USER`, `ADMIN`) |
| **profile_image** | VARCHAR(2048) | Y | - | NULL | 프로필 이미지 저장 위치 (S3 Object URL) |
| **created_at** | TIMESTAMP | N | - | CURRENT_TIMESTAMP | 회원 가입 일시 |
| **updated_at** | TIMESTAMP | N | - | CURRENT_TIMESTAMP | 회원 정보 수정 일시 (ON UPDATE 자동 갱신) |

---
### 2.2. region_codes (법정동 코드 마스터)
* **설명**: 한국관광공사의 [법정동 코드 조회] API 응답 결과를 사전에 적재(Caching)해 두어, 유저의 지역 검색 및 필터링 시 외부 API 의존 없이 자체 DB만으로 초고속 응답을 제공하기 위한 마스터 테이블입니다.
* **제약조건 및 비고**: 동일한 행정구역이 중복 적재되는 것을 막기 위해 시도 코드와 시군구 코드 조합은 유일무이해야 합니다.

| 컬럼명 | 데이터 타입 | Null | Key | Default | 설명 및 제약조건 | 
| :--- | :--- | :---: | :---: | :--- | :--- |
| id | BIGINT | N | PK | Auto Inc | 내부 지역 검색용 고유 식별자 | 
| ldong_regn_cd | VARCHAR(10) | N | UK1 | - | 법정동 시도 코드 (예: 11) | 
| ldong_regn_nm | VARCHAR(50) | N | - | - | 법정동 시도명 (예: 서울특별시) | 
| ldong_signgu_cd | VARCHAR(10) | N | UK1 | - | 법정동 시군구 코드 (예: 110) | 
| ldong_signgu_nm | VARCHAR(50) | N | - | - | 법정동 시군구명 (예: 종로구) | 

---

### 2.3. places (관광지 마스터)
* **설명**: 외부 공공 API(TourAPI)로부터 동기화되거나 자체 수집된 전국 관광지, 식당, 숙박시설의 원본 마스터 데이터를 보존합니다. 이전 버전의 지원 중단된 지역/분류 코드를 삭제하고, 최신 법정동 및 분류체계 코드를 도입했습니다.
* **제약조건 및 비고**: 위/경도 좌표는 연산 오차 방지를 위해 DECIMAL(13, 10) 타입을 엄격히 준수합니다. ldong_regn_cd와 ldong_signgu_cd는 region_codes 테이블을 참조하는 복합 외래키로 설정되어 참조 무결성을 보장한다. 복합 인덱스(Composite Index)의 경우 명시적으로 생성하는 것이 성능과 관리 측면에서 유리하기에 (ldong_regn_cd, ldong_signgu_cd)를 복합 인덱스 제약조건으로 설정한다.

| 컬럼명 | 데이터 타입 | Null | Key | Default | 설명 및 제약조건 |
| :--- | :--- | :---: | :---: | :--- | :--- |
| id | BIGINT | N | PK | Auto Inc | 내부 관리용 장소 고유 식별자 | 
| content_id | VARCHAR(50) | N | UK | - | 공공 API(TourAPI) 외부 시스템 연동 고유 식별 키 | 
| content_type_id | INT | N | - | - | 관광타입(12: 관광지, 39: 음식점 등) 식별 ID (기존 category 대체) | 
| title | VARCHAR(255) | N | - | - | 관광지 또는 업체 명칭 | 
| address | VARCHAR(500) | N | - | - | 도로명 주소 및 지번 주소 전체 (API의 addr1, addr2 결합) | 
| ldong_regn_cd | VARCHAR(10) | N | FK, IDX | - | 법정동 시도 코드 (region_codes 참조 및 검색 인덱스, 연쇄 수정: 지역 명칭은 그대로인데 코드만 변경될 경우 CASCADE를 통해 자동으로 동기화) | 
| ldong_signgu_cd | VARCHAR(10) | N | FK, IDX | - | 법정동 시군구 코드 (region_codes 참조 및 검색 인덱스, 연쇄 수정: 지역 명칭은 그대로인데 코드만 변경될 경우 CASCADE를 통해 자동으로 동기화) | 
| lcls_systm_1 | VARCHAR(10) | Y | - | NULL | 분류체계 대분류 (정교한 테마 필터링용) | 
| lcls_systm_2 | VARCHAR(10) | Y | - | NULL | 분류체계 중분류 | 
| lcls_systm_3 | VARCHAR(10) | Y | - | NULL | 분류체계 소분류 | 
| map_x | DECIMAL(13, 10) | N | - | - | 지도 매핑용 경도 (Longitude), 부동소수점 오차 원천 차단 | 
| map_y | DECIMAL(13, 10) | N | - | - | 지도 매핑용 위도 (Latitude), 부동소수점 오차 원천 차단 | 
| first_image | VARCHAR(2048) | Y | - | NULL | 관광지 원본 대표 이미지 URL (firstimage) | 
| first_image2 | VARCHAR(2048) | Y | - | NULL | 관광지 썸네일 대표 이미지 URL (firstimage2, 목록 렌더링 최적화용) | 
| cpyrht_div_cd | VARCHAR(10) | Y | - | NULL | 이미지 저작권 유형 (Type1, Type3 등 저장하여 법적 리스크 방지) | 
| tel | VARCHAR(50) | Y | - | NULL | 장소 공식 전화번호 | 
| homepage | TEXT | Y | - | NULL | 공식 홈페이지 링크 (detailCommon2에서 수집) | 
| overview | TEXT | Y | - | NULL | 장소에 대한 상세 소개 및 개요 텍스트 | 
| created_at | TIMESTAMP | N | - | CURRENT_TIMESTAMP | 데이터 최초 수집 일시 | 
| updated_at | TIMESTAMP | N | - | CURRENT_TIMESTAMP | 데이터 변경 일시 (ON UPDATE 자동 갱신) | 
is_deleted | BOOLEAN | N | - | false | 외부 API에서 삭제되었거나 영업 종료된 장소 여부 (Soft Delete 플래그) | 

---

### 2.4. saved_places (찜한 장소)
* **설명**: 사용자가 탐색 중 마음에 드는 장소를 개인 가방(바구니)에 담아둔 매핑 정보 테이블입니다.

| 컬럼명 | 데이터 타입 | Null | Key | Default | 설명 및 제약조건 |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **id** | BIGINT | N | PK | Auto Inc | 북마크 행위 고유 식별자 |
| **user_id** | BIGINT | N | FK | - | 찜한 유저 ID (`users.id` 참조, ON DELETE CASCADE) |
| **place_id** | BIGINT | N | FK | - | 대상 장소 ID (`places.id` 참조, ON DELETE CASCADE) |
| **created_at** | TIMESTAMP | N | - | CURRENT_TIMESTAMP | 찜한 일시 (마이페이지 정렬용) |

* **복합 유니크 제약**: `UNIQUE(user_id, place_id)` 설정을 통해 동일 장소에 대한 중복 찜 등록 방지.

---

### 2.5. trips (여행 일정 마스터)
* **설명**: 사용자가 설계한 여행 계획 플래너의 최상위 마스터 데이터입니다.

| 컬럼명 | 데이터 타입 | Null | Key | Default | 설명 및 제약조건 |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **id** | BIGINT | N | PK | Auto Inc | 여행 플랜 고유 식별자 |
| **user_id** | BIGINT | N | FK | - | 플랜 작성자 ID (`users.id` 참조, ON DELETE CASCADE) |
| **title** | VARCHAR(100) | N | - | - | 여행 플랜 제목 |
| **start_date** | DATE | N | - | - | 여행 출발 일자 |
| **end_date** | DATE | N | - | - | 여행 종료 일자 |
| **travel_style** | VARCHAR(50) | Y | - | NULL | 여행 성향 태그 (ex. 힐링, 액티비티, 식도락) |
| **transportation**| VARCHAR(50) | Y | - | NULL | 주 이동 수단 (ex. 자차, 대중교통, 도보) |
| **is_public** | BOOLEAN | N | - | false | 다른 유저에게 여행 플랜 공유 여부 |
| **created_at** | TIMESTAMP | N | - | CURRENT_TIMESTAMP | 플랜 생성 일시 |
| **updated_at** | TIMESTAMP | N | - | CURRENT_TIMESTAMP | 플랜 수정 일시 (ON UPDATE 자동 갱신) |

---

### 2.6. trip_days (일정 내 일자별 그룹)
* **설명**: 2박 3일, 3박 4일 등 소속 일정을 날짜 단위(1일차, 2일차...)로 격리 구조화합니다.

| 컬럼명 | 데이터 타입 | Null | Key | Default | 설명 및 제약조건 |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **id** | BIGINT | N | PK | Auto Inc | 특정 일자 그룹 고유 ID |
| **trip_id** | BIGINT | N | FK | - | 상위 여행 마스터 ID (`trips.id` 참조, ON DELETE CASCADE) |
| **day_number** | INT | N | - | - | n일차 수치 정보 (1, 2, 3...) |
| **trip_date** | DATE | N | - | - | 캘린더 연동 및 동선 매핑용 실제 서기 날짜 |

---

### 2.7. trip_places (일자별 세부 방문 여정)
* **설명**: 특정 일차(`trip_days`) 내에서 유저가 경유하기로 정한 장소들의 순서 및 시간대 정보를 관리합니다.

| 컬럼명 | 데이터 타입 | Null | Key | Default | 설명 및 제약조건 |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **id** | BIGINT | N | PK | Auto Inc | 세부 여정 아이템 고유 ID |
| **trip_day_id** | BIGINT | N | FK | - | 소속된 여행 일자 ID (`trip_days.id` 참조, ON DELETE CASCADE) |
| **place_id** | BIGINT | N | FK | - | 방문할 관광지 ID (`places.id` 참조, ON DELETE RESTRICT) |
| **visit_order** | INT | N | - | - | **당일 동선 상의 정렬 방문 순서 (1, 2, 3...)** |
| **memo** | VARCHAR(500) | Y | - | NULL | 여정 플래닝 도중 기록한 유저 한줄 메모 |
| **start_time** | TIME | Y | - | NULL | 예정 방문 시각 (UX 고려 Null 허용 필수) |
| **end_time** | TIME | Y | - | NULL | 예정 종료 시각 (UX 고려 Null 허용 필수) |

---

### 2.8. trip_logs (여행기 마스터)
* **설명**: 완료된 여행 일정을 바탕으로 소셜 커뮤니티 피드에 발행하는 매거진/블로그 형태의 포스트 마스터 테이블입니다.

| 컬럼명 | 데이터 타입 | Null | Key | Default | 설명 및 제약조건 |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **id** | BIGINT | N | PK | Auto Inc | 여행기 포스트 고유 식별자 |
| **user_id** | BIGINT | N | FK | - | 게시글 작성자 ID (`users.id` 참조, ON DELETE CASCADE) |
| **trip_id** | BIGINT | Y | FK | NULL | **기반이 된 원본 일정 ID (`trips.id` 참조, ON DELETE SET NULL)** |
| **title** | VARCHAR(150) | N | - | - | 여행기 메인 제목 |
| **content** | TEXT | N | - | - | 여행기 전체를 아우르는 에필로그/서문 |
| **region** | VARCHAR(50) | N | - | - | 검색 및 필터링 최적화를 위한 대상 주요 지역명 (반정규화) |
| **travel_style** | VARCHAR(50) | Y | - | NULL | 해당 후기글을 규정하는 스타일 태그 |
| **is_public** | BOOLEAN | N | - | true | 피드 메인 노출 공개 여부 (`false`: 나만보기 임시저장, `true`: 전체공개) |
| **view_count** | INT | N | - | 0 | 포스트 총 조회수 |
| **like_count** | INT | N | - | 0 | 실시간 정렬 집계 부하 절감을 위한 좋아요 총합 (반정규화 캐시) |
| **copy_count** | INT | N | - | 0 | 타 유저가 이 후기 코스를 자신의 플래너로 스크랩해간 횟수 |
| **created_at** | TIMESTAMP | N | - | CURRENT_TIMESTAMP | 게시글 최초 발행 일시 |
| **updated_at** | TIMESTAMP | N | - | CURRENT_TIMESTAMP | 게시글 최종 수정 일시 (ON UPDATE 자동 갱신) |

---

### 2.9. trip_place_logs (여행지별 상세 포토 리뷰)
* **설명**: 사용자가 다녀온 여행 일정 내 개별 장소마다 업로드한 스냅샷 정보, 사진 배열 및 상세 감상평이 기록됩니다.
* **아키텍처적 비고**: 상위 플래너(`trips`, `trip_places`)가 차후 수정되거나 완전 삭제되어도 이미 작성된 커뮤니티 글이 훼손되지 않도록 `place_id`만 유지한 채 당시의 방문 일차와 순서를 **값(Snapshot)**으로 복사하여 보존합니다.

| 컬럼명 | 데이터 타입 | Null | Key | Default | 설명 및 제약조건 |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **id** | BIGINT | N | PK | Auto Inc | 장소별 포토 리뷰 고유 식별자 |
| **trip_log_id** | BIGINT | N | FK | - | 상위 여행기 마스터 ID (`trip_logs.id` 참조, ON DELETE CASCADE) |
| **place_id** | BIGINT | N | FK | - | 후기의 대상이 되는 원본 장소 ID (`places.id` 참조, ON DELETE RESTRICT) |
| **visit_order** | INT | N | - | - | **기록 작성 시점의 당시 방문 순서 데이터 백업** |
| **day_number** | INT | N | - | - | **기록 작성 시점의 당시 방문 일차 데이터 백업** |
| **review_content**| TEXT | Y | - | NULL | 해당 장소에 특화된 사용자 상세 후기 텍스트 |
| **image_url** | TEXT | Y | - | NULL | 쉼표(,) 구분자 기반 문자열 또는 JSON Array 규격의 다중 이미지 스토리지 URL 배열 |

---

### 2.10. trip_log_comments (여행기 댓글)
* **설명**: 공유된 여행기 게시글 하단에서 다른 회원들과 의사소통할 수 있는 피드백 데이터입니다.

| 컬럼명 | 데이터 타입 | Null | Key | Default | 설명 및 제약조건 |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **id** | BIGINT | N | PK | Auto Inc | 댓글 고유 식별자 |
| **trip_log_id** | BIGINT | N | FK | - | 대상 여행기 ID (`trip_logs.id` 참조, ON DELETE CASCADE) |
| **user_id** | BIGINT | N | FK | - | 댓글 작성자 ID (`users.id` 참조, ON DELETE CASCADE) |
| **content** | TEXT | N | - | - | 댓글 본문 내용 |
| **created_at** | TIMESTAMP | N | - | CURRENT_TIMESTAMP | 댓글 등록 일시 |
| **updated_at** | TIMESTAMP | N | - | CURRENT_TIMESTAMP | 댓글 수정 일시 (ON UPDATE 자동 갱신) |

---

### 2.11. trip_log_likes (여행기 좋아요 매핑)
* **설명**: 회원별 특정 여행기에 대한 좋아요 유무 상태를 격리 기록합니다.

| 컬럼명 | 데이터 타입 | Null | Key | Default | 설명 및 제약조건 |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **id** | BIGINT | N | PK | Auto Inc | 대리 식별자 |
| **trip_log_id** | BIGINT | N | FK | - | 좋아요 대상 게시글 ID (`trip_logs.id` 참조, ON DELETE CASCADE) |
| **user_id** | BIGINT | N | FK | - | 좋아요 클릭 유저 ID (`users.id` 참조, ON DELETE CASCADE) |
| **created_at** | TIMESTAMP | N | - | CURRENT_TIMESTAMP | 좋아요 클릭 일시 |

* **복합 유니크 제약**: `UNIQUE(trip_log_id, user_id)` 설정을 통해 1인당 1개 게시글 중복 좋아요 가산 방지.

---

### 2.12. trip_log_bookmarks (여행기 스크랩/북마크 매핑)
* **설명**: 유저가 피드를 탐색하다가 마음에 드는 타인의 후기글을 피드 보관함에 저장해두는 관계 데이터입니다.

| 컬럼명 | 데이터 타입 | Null | Key | Default | 설명 및 제약조건 |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **id** | BIGINT | N | PK | Auto Inc | 대리 식별자 |
| **trip_log_id** | BIGINT | N | FK | - | 북마크 대상 게시글 ID (`trip_logs.id` 참조, ON DELETE CASCADE) |
| **user_id** | BIGINT | N | FK | - | 북마크 행위 유저 ID (`users.id` 참조, ON DELETE CASCADE) |
| **created_at** | TIMESTAMP | N | - | CURRENT_TIMESTAMP | 스크랩 일시 |

* **복합 유니크 제약**: `UNIQUE(trip_log_id, user_id)` 설정을 통해 중복 보관함 적재 차단.

---

### 2.13. notices (공지사항)
* **설명**: 전체 이용자들을 대상으로 공표하는 비즈니스 알림 공지 정보입니다.
* **애플리케이션 검증 필수**: DB 외래키 제약만으로는 일반 사용자의 입력을 막지 못하므로, 서비스 컴포넌트 계층에서 작성자의 `users.role = 'ADMIN'` 상태를 인터셉터/가드로 철저히 검증해야 합니다.

| 컬럼명 | 데이터 타입 | Null | Key | Default | 설명 및 제약조건 |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **id** | BIGINT | N | PK | Auto Inc | 공지사항 고유 식별자 |
| **admin_id** | BIGINT | N | FK | - | 작성 관리자 식별 ID (`users.id` 참조, ON DELETE RESTRICT) |
| **title** | VARCHAR(150) | N | - | - | 공지사항 타이틀 |
| **content** | TEXT | N | - | - | 공지사항 텍스트 본문 (Rich Editor HTML 포맷 수용 가능) |
| **created_at** | TIMESTAMP | N | - | CURRENT_TIMESTAMP | 공지사항 게시 일시 |
| **updated_at** | TIMESTAMP | N | - | CURRENT_TIMESTAMP | 공지사항 갱신 일시 (ON UPDATE 자동 갱신) |