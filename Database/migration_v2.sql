-- CourseKok DB Migration v2
-- 실행 전제: migration_v1 (CourseKok DDL.sql) 이 이미 적용되어 있어야 합니다.
--
-- ※ spring.jpa.hibernate.ddl-auto=update 환경에서는
--   백엔드를 실행하면 JPA가 Entity에 맞춰 컬럼을 자동 추가합니다.
--   (trips, trip_logs, trip_place_logs의 신규 컬럼 포함)
--
-- 이 파일에서 수동 실행이 반드시 필요한 부분:
--   trip_place_logs.place_id → NULL 허용 변경 (JPA가 자동 처리 불가)

USE travel_db;

-- ──────────────────────────────────────────────
-- trip_place_logs: place_id NULL 허용으로 변경
-- (AI 생성 장소는 places 테이블에 없을 수 있음)
-- ──────────────────────────────────────────────
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE trip_place_logs
    MODIFY COLUMN place_id BIGINT NULL COMMENT '참조 장소 마스터 ID (AI 생성 장소면 NULL 가능)';

SET FOREIGN_KEY_CHECKS = 1;

-- ──────────────────────────────────────────────
-- 아래는 JPA(ddl-auto=update)가 처리하지 못하는 경우에만 수동 실행
-- (백엔드를 먼저 실행했다면 이미 컬럼이 존재하므로 실행 불필요)
-- ──────────────────────────────────────────────

-- trips 테이블 신규 컬럼 (백엔드 재시작 시 JPA 자동 추가됨)
-- ALTER TABLE trips
--     ADD COLUMN cover_image      VARCHAR(2048) NULL COMMENT '여행 커버 이미지 URL',
--     ADD COLUMN region           VARCHAR(50)   NULL COMMENT '여행 지역',
--     ADD COLUMN period           VARCHAR(50)   NULL COMMENT '여행 기간',
--     ADD COLUMN style            VARCHAR(50)   NULL COMMENT '여행 스타일',
--     ADD COLUMN ai_plan_snapshot LONGTEXT      NULL COMMENT 'AI 생성 일정 JSON 스냅샷';

-- trip_logs 테이블 신규 컬럼 (백엔드 재시작 시 JPA 자동 추가됨)
-- ALTER TABLE trip_logs
--     ADD COLUMN cover_image VARCHAR(2048) NULL COMMENT '여행기 대표 이미지 URL',
--     ADD COLUMN mood        VARCHAR(50)   NULL COMMENT '여행 기분';

-- trip_place_logs 스냅샷 필드 (백엔드 재시작 시 JPA 자동 추가됨)
-- ALTER TABLE trip_place_logs
--     ADD COLUMN place_title    VARCHAR(255)  NULL COMMENT '장소 이름 스냅샷',
--     ADD COLUMN place_category VARCHAR(50)   NULL COMMENT '장소 카테고리 스냅샷',
--     ADD COLUMN place_image    VARCHAR(2048) NULL COMMENT '장소 이미지 스냅샷',
--     ADD COLUMN rating         DOUBLE        NULL COMMENT '장소 만족도 평점';
