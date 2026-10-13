# 2026-10-13 Docker로 MySQL 띄우고 백엔드 연결

## 목표

- 노트북에 MySQL 설치 없이 Docker로 DB 준비
- 백엔드를 그 DB에 연결해서 정상 실행 확인
- 백엔드를 Docker 이미지로 만들기 전, "DB만 있으면 백엔드가 켜지는 상태"부터 확보

## 한 것

### 1. 저장소 준비

- 기존 코스콕 저장소를 미러링해서 `coursekok-v2`로 독립
  - 포크 대신 미러링: 원본과 연결이 끊긴 독립 저장소라 이후 작업이 전부 내 기록으로 남음
- 현재 Vue 상태에 `v1-vue` 태그 부착 → React 전환 후에도 비교 가능

### 2. Docker로 MySQL 실행

```
docker run -d --name coursekok-db -e MYSQL_ROOT_PASSWORD=<비밀번호> -p 3307:3306 mysql:8.4
```

- `-d`: 백그라운드 실행
- `--name`: 이후 cp, exec에서 가리킬 컨테이너 이름
- `-e`: 컨테이너에 환경변수 전달 (MySQL 이미지는 root 비밀번호 필수)
- `-p 3307:3306`: 노트북 3307 → 컨테이너 3306 연결. 노트북 MySQL(3306)과 충돌 방지
- `mysql:8.4`: 버전 고정. 생략 시 매번 최신 버전이라 환경이 달라질 수 있음

### 3. 테이블 생성

```
docker cp "Database/CourseKok DDL.sql" coursekok-db:/ddl.sql
docker cp "Database/migration_v2.sql" coursekok-db:/migration_v2.sql
docker exec -i coursekok-db mysql -uroot -p -e "source /ddl.sql"
docker exec -i coursekok-db mysql -uroot -p travel_db -e "source /migration_v2.sql"
```

- `docker cp`: 컨테이너는 노트북 파일을 못 보므로 안으로 복사
- `docker exec`: 실행 중인 컨테이너 안에서 명령 실행 (`run`은 새 컨테이너 생성)
- ddl.sql은 `CREATE DATABASE`, `USE`가 포함돼 DB 이름 생략, migration_v2.sql은 DB 지정 필요
- 실행 순서 중요: v1(DDL) → v2

### 4. 백엔드 연결

- `application.properties`는 `${DB_URL}` 같은 빈칸만 두고, 실제 값은 `application-secret.properties`에 분리 (`.gitignore` 대상)
- `spring.config.import`로 비밀 파일을 같이 읽는 구조

```
DB_URL=jdbc:mysql://localhost:3307/travel_db?serverTimezone=UTC&characterEncoding=UTF-8
```

- 포트 3307: 노트북 입장에서 Docker 통로 번호
- `serverTimezone=UTC`: Docker MySQL 기본 시계가 UTC라 맞춰야 시간 변환이 안 어긋남
- `characterEncoding=UTF-8`: 한글 깨짐 방지

## 배운 개념

- 이미지 vs 컨테이너: 설계도 vs 실제 실행 중인 상자
- 포트 매핑: 컨테이너는 자기만의 네트워크를 가짐. 밖에서 접속하려면 통로를 열어야 함
- 비밀값 관리: 명령어에 비밀번호 직접 입력 시 기록, 프로세스 목록, `docker inspect`에 노출됨
  - 직접 접속은 `-p`만 쓰고 프롬프트로 입력
  - Docker는 `--env-file .env`, 서버는 GitHub Secrets 같은 금고 사용 예정
  - 운영에선 root 대신 권한 제한된 전용 계정, DB 포트 외부 비공개
- JWT secret: 토큰 서명용 비밀 열쇠. 유출 시 토큰 위조 가능, 변경 시 전원 로그아웃. HS256은 32바이트 이상 필요
- `ddl-auto=update`: 서버 시작 시 Entity 기준으로 테이블/컬럼 자동 추가. 개발용으로 편하지만 변경 기록이 안 남아 운영에선 Flyway 같은 마이그레이션 도구 사용

## 트러블슈팅

### `-P`와 `-p` 혼동

- 증상: `Unable to find image '3307:3306' locally`
- 원인: `-P`(대문자)는 값을 안 받는 옵션이라 `3307:3306`을 이미지 이름으로 읽음
- 해결: `-p`(소문자)로 수정
- 배운 점: 옵션 대소문자에 따라 의미가 완전히 다름. 에러 메시지에 무엇을 무엇으로 읽었는지 그대로 나와 있음

### `source` 뒤 공백 누락

- 증상: `ERROR 1064 ... near 'source/migration_v2.sql'`
- 원인: 공백이 없어 한 단어로 인식
- 배운 점: 1064는 MySQL 문법 오류 번호, `near '...'`가 위치 힌트

### BOM 때문에 `DB_URL`을 못 읽음

- 증상: `Driver ... claims to not accept jdbcUrl, ${DB_URL}` → 이후 Dialect, Bean 생성 에러 연쇄
- 원인: `application-secret.properties.example` 맨 앞에 UTF-8 BOM(EF BB BF)이 있었고, 복사한 파일에도 따라옴. Java properties 로더가 BOM을 지우지 않아 첫 키가 `DB_URL`이 아닌 다른 이름으로 인식됨. 두 번째 줄부터는 정상이라 URL만 실패
- 해결: VS Code에서 Save with Encoding → UTF-8로 재저장
- 배운 점: 긴 에러 로그는 맨 아래 `Caused by`뿐 아니라 처음 나온 WARN/ERROR를 같이 봐야 함. 뒤쪽 에러는 첫 실패의 연쇄 결과인 경우가 많음

### `KAKAO_REST_API_KEY` 미설정

- 증상: `Could not resolve placeholder 'KAKAO_REST_API_KEY'`
- 원인: `application.properties`의 `kakaomobility.rest-api-key=${KAKAO_REST_API_KEY}`를 채울 값이 없음. Java 코드의 기본값은 이 줄 때문에 사용되지 않음
- 해결: `application-secret.properties`에 값 추가

## 발견한 보안 문제

- `application.properties`에 TourAPI 키가 주석으로 남아 있었음 → 줄 삭제
- `KakaoMobilityClient.java`의 `@Value` 기본값에 카카오 REST 키가 하드코딩됨 → 기본값 제거, 비밀 파일로 이동 예정
- 줄을 지워도 커밋 기록에는 남으므로, 저장소가 public이면 키 재발급 필요
- 프론트 `aiPlanner.js`가 Vite 개발 프록시로 카카오 API를 직접 호출 → 빌드 후엔 프록시가 없어 동작 안 하고, REST 키가 브라우저에 노출됨. 백엔드 `KakaoMobilityClient`로 돌릴 예정

## 다음에 할 것

- [ ] `application-secret.properties.example` BOM 제거 후 커밋
- [ ] `KakaoMobilityClient.java` 하드코딩 키 제거
- [ ] 백엔드 Dockerfile 작성 (`mvnw`로 빌드 → `java -jar` 실행)
