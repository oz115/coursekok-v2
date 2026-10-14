# 2026-10-14 Docker Compose로 백엔드 + DB 묶기

## 목표

- 여러 번 치던 `docker run` 명령을 파일 하나(`docker-compose.yml`)로 정리
- 백엔드가 노트북을 거치지 않고 DB 컨테이너에 바로 접속
- DB 초기화(테이블 생성)와 데이터 보존 자동화
- 비밀값을 `.env`로 분리

## 정리: 로컬 개발 방식과 배포 방식

|        | 로컬 개발                       | 배포 (오늘 연습한 방식)                  |
| ------ | ------------------------------- | ---------------------------------------- |
| DB     | Docker                          | Docker                                   |
| 백엔드 | IntelliJ / VS Code로 직접 실행  | Docker 컨테이너                          |
| 비밀값 | `application-secret.properties` | `.env` → 환경변수                        |
| 이유   | 코드 수정 후 바로 확인          | 서버엔 IDE가 없음. 서버와 같은 환경 확인 |

- 컨테이너를 켜는 것 = 백엔드 실행. Dockerfile의 `ENTRYPOINT`가 켜질 때 `java -jar`를 자동 실행
- 두 방식을 동시에 켜면 8080 포트 충돌. 하나만 사용
- Compose 파일 하나로 둘 다 가능
  - `docker compose up -d db`: DB만 (로컬 개발)
  - `docker compose up -d --build`: 전체 (배포 연습)

## 한 것

### docker-compose.yml (저장소 루트)

```yaml
services:
  db:
    image: mysql:8.4
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
    ports:
      - "3307:3306"
    volumes:
      - db-data:/var/lib/mysql
      - "./Database/CourseKok DDL.sql:/docker-entrypoint-initdb.d/01-ddl.sql:ro"
      - "./Database/migration_v2.sql:/docker-entrypoint-initdb.d/02-migration-v2.sql:ro"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      retries: 10

  backend:
    build: ./backend/CourseKok
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8080:8080"
    environment:
      DB_URL: jdbc:mysql://db:3306/travel_db?serverTimezone=UTC&characterEncoding=UTF-8
      DB_USERNAME: root
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      KAKAO_REST_API_KEY: ${KAKAO_REST_API_KEY}
      TOURAPI_SERVICE_KEY: ${TOURAPI_SERVICE_KEY}

volumes:
  db-data:
```

### `docker run`과 대응

| Compose                      | docker run          |
| ---------------------------- | ------------------- |
| 서비스 이름(`db`, `backend`) | `--name`            |
| `image`                      | `docker run 이미지` |
| `build`                      | `docker build`      |
| `ports`                      | `-p`                |
| `environment`                | `-e`                |

### 새로 쓴 것

- 서비스 이름으로 통신: `DB_URL`의 `db:3306`
  - Compose 컨테이너들은 같은 네트워크에 들어가서 서비스 이름이 주소가 됨
  - 어제는 `host.docker.internal:3307`로 노트북을 거쳐 우회
  - 컨테이너끼리는 내부 포트(3306) 사용
- 볼륨
  - `db-data:/var/lib/mysql`: 컨테이너를 지워도 DB 데이터 유지
  - `/docker-entrypoint-initdb.d/`: MySQL이 처음 켜질 때 이 폴더의 SQL을 이름순 실행. 어제 `docker cp` + `source`로 손으로 하던 작업 자동화. `01-`, `02-`로 순서 지정, `:ro`는 읽기 전용
- `healthcheck` + `depends_on: condition: service_healthy`
  - MySQL이 응답할 때까지 백엔드 시작 대기. 없으면 백엔드가 먼저 켜져 DB 접속 실패
- `.env`: Compose가 읽어서 `${...}`를 채움. 실행 시점에만 컨테이너에 주입되고 이미지에는 안 들어감

### 포트 포워딩이 필요한 경우

- 포트 포워딩은 노트북(컨테이너 밖)에서 안으로 들어가는 문. 컨테이너끼리는 불필요
- backend 8080: 브라우저, 프론트가 접속해야 해서 필요
- db 3307: 백엔드는 안 씀. 노트북에서 DB 도구로 직접 볼 때만 필요
- 운영 서버에서는 DB 포트를 열지 않음

### 실행과 확인

```
docker compose up -d --build
docker compose ps
docker compose logs -f backend
docker compose exec db mysql -uroot -p travel_db -e "SHOW TABLES;"
```

- `--build`: 이미지를 새로 만들고 실행. 빼면 기존 이미지 사용
- `compose exec`는 컨테이너 이름 대신 서비스 이름 사용
- SQL을 직접 넣지 않았는데 테이블 생성 확인 → initdb 동작 확인

## 배운 개념

- 세 설정 파일은 읽는 주체가 다름
  - `application.properties`: Spring. 설정의 모양(빈칸)
  - `application-secret.properties`: Spring. IDE 실행 시 빈칸 채우기
  - `.env`: Docker Compose. Compose 실행 시 빈칸 채우기 → 환경변수로 전달
  - 두 비밀 파일 값은 맞춰 둘 것
- 환경변수 이름은 대문자 + 밑줄 (`JWT_SECRET`). Spring 형식(`jwt.secret`)을 그대로 쓰면 Compose가 못 찾음
- YAML은 들여쓰기가 소속. 같은 칸 = 형제, 더 들어감 = 자식
- `compose up`은 컨테이너가 없으면 만들고, 있으면 다시 켜고, 설정이 바뀌면 다시 만듦
- Docker 명령/키는 외우기보다 의미를 설명할 수 있을 정도로. 나머지는 문서 참고

## 트러블슈팅

### `.dockerignore` 저장 시 `\*`로 바뀜

- 원인: VS Code가 파일을 Markdown으로 인식, 저장 시 자동 정리가 `*`를 이스케이프
- 해결: 상태 표시줄의 파일 종류를 Ignore(또는 Plain Text)로 변경 후 저장
- 배운 점: 저장할 때마다 내용이 바뀌면 파일 종류(언어 모드)부터 확인

## 다음에 할 것

- [ ] 프론트 Dockerfile 작성 (Node 빌드 → Nginx)
- [ ] Nginx에서 `/api` 요청을 백엔드로 전달, SPA 새로고침 404 처리
- [ ] Compose에 프론트 추가 → 3단계 완료
- [ ] `KakaoMobilityClient.java` 하드코딩 키 제거
