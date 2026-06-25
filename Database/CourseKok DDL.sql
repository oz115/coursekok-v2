-- 데이터베이스 생성 및 선택
DROP DATABASE IF EXISTS travel_db;

CREATE DATABASE travel_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE travel_db;

-- 1. users (회원 테이블)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT COMMENT '유저 고유 식별자',
    email VARCHAR(100) NOT NULL COMMENT '로그인 이메일 및 ID',
    password VARCHAR(255) NOT NULL COMMENT '암호화된 비밀번호 (Bcrypt용)',
    nickname VARCHAR(50) NOT NULL COMMENT '커뮤니티용 닉네임',
    role VARCHAR(20) DEFAULT 'USER' NOT NULL COMMENT '권한 (USER, ADMIN)',
    profile_image VARCHAR(2048) NULL COMMENT '프로필 이미지 주소',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '생성일',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '수정일',
    PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_nickname UNIQUE (nickname)
) ENGINE = InnoDB;

-- 2. region_codes (법정동 코드 마스터 테이블)
CREATE TABLE IF NOT EXISTS region_codes (
    id BIGINT AUTO_INCREMENT COMMENT '내부 지역 검색용 고유 식별자',
    ldong_regn_cd VARCHAR(10) NOT NULL COMMENT '법정동 시도 코드 (예: 11)',
    ldong_regn_nm VARCHAR(50) NOT NULL COMMENT '법정동 시도명 (예: 서울특별시)',
    ldong_signgu_cd VARCHAR(10) NOT NULL COMMENT '법정동 시군구 코드 (예: 110)',
    ldong_signgu_nm VARCHAR(50) NOT NULL COMMENT '법정동 시군구명 (예: 종로구)',
    PRIMARY KEY (id),
    CONSTRAINT uq_region_codes UNIQUE (
        ldong_regn_cd,
        ldong_signgu_cd
    )
) ENGINE = InnoDB COMMENT = '법정동 코드 캐싱 및 지역 검색용 테이블';

-- 3. places (관광지 마스터 테이블)
CREATE TABLE IF NOT EXISTS places (
    id BIGINT AUTO_INCREMENT COMMENT '내부 관리용 장소 고유 식별자',
    content_id VARCHAR(50) NOT NULL COMMENT '공공 API(TourAPI) 외부 시스템 연동 고유 식별 키',
    content_type_id INT NOT NULL COMMENT '관광타입 식별 ID (12: 관광지, 39: 음식점 등)',
    title VARCHAR(255) NOT NULL COMMENT '관광지 또는 업체 명칭',
    address VARCHAR(500) NOT NULL COMMENT '도로명 주소 및 지번 주소 전체 (addr1, addr2 결합)',
    ldong_regn_cd VARCHAR(10) NOT NULL COMMENT '법정동 시도 코드 (폐기된 area_code 완벽 대체)',
    ldong_signgu_cd VARCHAR(10) NOT NULL COMMENT '법정동 시군구 코드 (폐기된 area_code 완벽 대체)',
    lcls_systm_1 VARCHAR(10) NULL COMMENT '분류체계 대분류',
    lcls_systm_2 VARCHAR(10) NULL COMMENT '분류체계 중분류',
    lcls_systm_3 VARCHAR(10) NULL COMMENT '분류체계 소분류',
    map_x DECIMAL(13, 10) NOT NULL COMMENT '지도 매핑용 경도 (부동소수점 오차 원천 차단)',
    map_y DECIMAL(13, 10) NOT NULL COMMENT '지도 매핑용 위도 (부동소수점 오차 원천 차단)',
    first_image VARCHAR(2048) NULL COMMENT '관광지 원본 대표 이미지 URL',
    first_image2 VARCHAR(2048) NULL COMMENT '관광지 썸네일 대표 이미지 URL (목록 렌더링 최적화용)',
    cpyrht_div_cd VARCHAR(10) NULL COMMENT '이미지 저작권 유형 (Type1, Type3 등 저장)',
    tel VARCHAR(255) NULL COMMENT '장소 공식 전화번호',
    homepage TEXT NULL COMMENT '공식 홈페이지 링크',
    overview TEXT NULL COMMENT '장소에 대한 상세 소개 및 개요 텍스트',
    views INT DEFAULT 0 NOT NULL COMMENT '조회수',
    rating DOUBLE DEFAULT 0.0 NOT NULL COMMENT '평점',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '데이터 최초 수집 일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '데이터 변경 일시',
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL COMMENT '외부 API 삭제 및 영업 종료 여부 (Soft Delete)',
    PRIMARY KEY (id),
    CONSTRAINT uq_places_content_id UNIQUE (content_id),
    CONSTRAINT fk_places_region_codes FOREIGN KEY (
        ldong_regn_cd,
        ldong_signgu_cd
    ) REFERENCES region_codes (
        ldong_regn_cd,
        ldong_signgu_cd
    ) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_places_region (
        ldong_regn_cd,
        ldong_signgu_cd
    )
) ENGINE = InnoDB COMMENT = '한국관광공사 API 기반 장소 마스터 데이터';

-- 4. trips (여행 일정 마스터)
CREATE TABLE IF NOT EXISTS trips (
    id BIGINT AUTO_INCREMENT COMMENT '여행 플랜 고유 ID',
    user_id BIGINT NOT NULL COMMENT '생성자 ID',
    title VARCHAR(100) NOT NULL COMMENT '여행 제목',
    start_date DATE NOT NULL COMMENT '여행 시작일',
    end_date DATE NOT NULL COMMENT '여행 종료일',
    travel_style VARCHAR(50) NULL COMMENT '여행 스타일 태그',
    transportation VARCHAR(50) NULL COMMENT '이동 수단',
    is_public BOOLEAN DEFAULT FALSE NOT NULL COMMENT '플랜 공개 여부 (false:비공개, true:공개)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_trips_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- 5. trip_days (여행 일정 내 일자별 그룹핑)
CREATE TABLE IF NOT EXISTS trip_days (
    id BIGINT AUTO_INCREMENT COMMENT '일자 고유 ID',
    trip_id BIGINT NOT NULL COMMENT '참조 여행 플랜 ID',
    day_number INT NOT NULL COMMENT 'n일차 (1, 2, 3...)',
    trip_date DATE NOT NULL COMMENT '해당 일자 날짜',
    PRIMARY KEY (id),
    CONSTRAINT fk_trip_days_trip_id FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- 6. trip_places (일자별 방문 세부 장소)
CREATE TABLE IF NOT EXISTS trip_places (
    id BIGINT AUTO_INCREMENT COMMENT '세부 여정 고유 ID',
    trip_day_id BIGINT NOT NULL COMMENT '참조 일자 ID',
    place_id BIGINT NOT NULL COMMENT '참조 장소 마스터 ID',
    visit_order INT NOT NULL COMMENT '방문 순서',
    memo VARCHAR(500) NULL COMMENT '한줄 메모',
    start_time TIME NULL COMMENT '방문 시작 시간',
    end_time TIME NULL COMMENT '방문 종료 시간',
    PRIMARY KEY (id),
    CONSTRAINT fk_trip_places_trip_day_id FOREIGN KEY (trip_day_id) REFERENCES trip_days (id) ON DELETE CASCADE,
    CONSTRAINT fk_trip_places_place_id FOREIGN KEY (place_id) REFERENCES places (id) ON DELETE RESTRICT
) ENGINE = InnoDB;

-- 7. trip_logs (매거진형 여행기 마스터)
CREATE TABLE IF NOT EXISTS trip_logs (
    id BIGINT AUTO_INCREMENT COMMENT '여행기 고유 ID',
    user_id BIGINT NOT NULL COMMENT '작성자 ID',
    trip_id BIGINT NULL COMMENT '기반이 된 여행 플랜 ID (삭제 시 NULL)',
    title VARCHAR(150) NOT NULL COMMENT '여행기 제목',
    content TEXT NOT NULL COMMENT '여행기 서문 및 총평',
    region VARCHAR(50) NOT NULL COMMENT '지역 필터 및 검색용',
    travel_style VARCHAR(50) NULL COMMENT '여행 스타일 태그',
    is_public BOOLEAN DEFAULT FALSE NOT NULL COMMENT '게시글 공개 여부 (false:비공개, true:공개)',
    view_count INT DEFAULT 0 NOT NULL COMMENT '조회수',
    like_count INT DEFAULT 0 NOT NULL COMMENT '좋아요 수 캐시 필드',
    copy_count INT DEFAULT 0 NOT NULL COMMENT '스크랩 횟수 캐시 필드',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_trip_logs_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_trip_logs_trip_id FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE SET NULL
) ENGINE = InnoDB;

-- 8. trip_place_logs (여행지별 상세 포토 리뷰 - 스냅샷 구조)
CREATE TABLE IF NOT EXISTS trip_place_logs (
    id BIGINT AUTO_INCREMENT COMMENT '장소 리뷰 고유 ID',
    trip_log_id BIGINT NOT NULL COMMENT '참조 여행기 ID',
    place_id BIGINT NOT NULL COMMENT '참조 장소 마스터 ID',
    visit_order INT NOT NULL COMMENT '당시 방문 순서 스냅샷',
    day_number INT NOT NULL COMMENT '당시 방문 일차 스냅샷',
    review_content TEXT NULL COMMENT '해당 장소 상세 후기',
    image_url TEXT NULL COMMENT '쉼표분리 혹은 JSON 형태의 이미지 배열',
    PRIMARY KEY (id),
    CONSTRAINT fk_trip_place_logs_trip_log_id FOREIGN KEY (trip_log_id) REFERENCES trip_logs (id) ON DELETE CASCADE,
    CONSTRAINT fk_trip_place_logs_place_id FOREIGN KEY (place_id) REFERENCES places (id) ON DELETE RESTRICT
) ENGINE = InnoDB;

-- 9. trip_log_comments (여행기 댓글)
CREATE TABLE IF NOT EXISTS trip_log_comments (
    id BIGINT AUTO_INCREMENT COMMENT '댓글 고유 ID',
    trip_log_id BIGINT NOT NULL COMMENT '참조 여행기 ID',
    user_id BIGINT NOT NULL COMMENT '댓글 작성자 ID',
    content TEXT NOT NULL COMMENT '댓글 본문',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_tl_comments_trip_log_id FOREIGN KEY (trip_log_id) REFERENCES trip_logs (id) ON DELETE CASCADE,
    CONSTRAINT fk_tl_comments_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- 10. trip_log_likes (여행기 좋아요 - 중복 방지 매핑)
CREATE TABLE IF NOT EXISTS trip_log_likes (
    id BIGINT AUTO_INCREMENT,
    trip_log_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_tl_likes_trip_log_id FOREIGN KEY (trip_log_id) REFERENCES trip_logs (id) ON DELETE CASCADE,
    CONSTRAINT fk_tl_likes_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_tl_likes_user_log UNIQUE (trip_log_id, user_id)
) ENGINE = InnoDB;

-- 11. trip_log_bookmarks (여행기 북마크/스크랩 - 중복 방지 매핑)
CREATE TABLE IF NOT EXISTS trip_log_bookmarks (
    id BIGINT AUTO_INCREMENT,
    trip_log_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_tl_bookmarks_trip_log_id FOREIGN KEY (trip_log_id) REFERENCES trip_logs (id) ON DELETE CASCADE,
    CONSTRAINT fk_tl_bookmarks_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_tl_bookmarks_user_log UNIQUE (trip_log_id, user_id)
) ENGINE = InnoDB;

-- 12. notices (공지사항)
CREATE TABLE IF NOT EXISTS notices (
    id BIGINT AUTO_INCREMENT COMMENT '공지사항 고유 ID',
    admin_id BIGINT NOT NULL COMMENT '작성 관리자 ID',
    title VARCHAR(150) NOT NULL COMMENT '공지 제목',
    content TEXT NOT NULL COMMENT '공지 본문 (HTML 가능)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_notices_admin_id FOREIGN KEY (admin_id) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE = InnoDB;

ALTER TABLE trip_place_logs
  MODIFY COLUMN place_id BIGINT NULL,
  MODIFY COLUMN image_url MEDIUMTEXT;