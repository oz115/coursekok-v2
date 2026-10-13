# 2026-10-13 백엔드 Dockerfile 작성, 이미지로 실행

## 목표

- 남이 만든 이미지(mysql)를 쓰는 단계에서, 내 프로젝트로 이미지를 직접 만드는 단계로
- 백엔드를 노트북 실행이 아닌 컨테이너로 띄우고, Docker MySQL에 연결

## 한 것

### 1. jar 빌드

```
.\mvnw.cmd clean package -DskipTests
```

- `clean`: 이전 빌드 결과(target) 삭제
- `package`: 컴파일 후 jar로 묶기 → `target/CourseKok-0.0.1-SNAPSHOT.jar`
- `-DskipTests`: 이미지 만들기가 목표라 테스트 생략. 테스트는 CI 단계에서 처리 예정
- Maven Wrapper(mvnw): Maven 설치 없이 프로젝트에 포함된 스크립트로 빌드

### 2. Dockerfile (backend/CourseKok/Dockerfile)

```dockerfile
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY target/CourseKok-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

- `FROM`: 시작 이미지. 빌드는 노트북에서 끝났으므로 실행만 하는 JRE 사용 (JDK보다 가벼움)
- `WORKDIR`: 컨테이너 안 작업 폴더
- `COPY`: 빌드 컨텍스트의 파일을 이미지 안으로 복사
- `EXPOSE`: 사용하는 포트 표시용 메모. 실제 개방은 `docker run -p`
- `ENTRYPOINT`: 컨테이너가 켜질 때 실행할 명령

### 3. 이미지 빌드

```
docker build -t coursekok-backend:v1 .
```

- `-t 이름:태그`: 이미지 이름표
- 끝의 `.`: 빌드 컨텍스트(재료로 쓸 폴더). 빠지면 `requires 1 argument` 에러

### 4. 컨테이너 실행

```
docker run -d --name coursekok-backend -p 8080:8080 -e DB_URL="jdbc:mysql://host.docker.internal:3307/travel_db?serverTimezone=UTC&characterEncoding=UTF-8" coursekok-backend:v1
docker logs -f coursekok-backend
```

- `http://localhost:8080/swagger-ui/index.html` 접속 확인

### 5. 비밀값이 이미지에 들어가지 않게 정리

- `application.properties`: `spring.config.import=optional:application-secret.properties`
  - 파일이 있으면 읽고 없으면 넘어감. 노트북은 파일로, 컨테이너는 환경변수로 값 주입
- `.dockerignore` 추가: 비밀 설정 파일, 에디터 설정을 빌드 컨텍스트에서 제외

## 배운 개념

- Dockerfile → (`docker build`) → 이미지 → (`docker run`) → 컨테이너
  - `run`은 Dockerfile을 다시 읽지 않음. Dockerfile이나 jar가 바뀌면 build부터 다시
  - `--name`(컨테이너 이름)과 마지막 인자(이미지 이름:태그)는 별개
- `run`(새로 만들고 켜기) / `stop` / `start`(꺼진 컨테이너 다시 켜기) / `rm`(삭제)
  - 같은 이름으로 다시 `run` 하려면 `rm -f`로 기존 컨테이너 삭제 필요
- 레이어와 캐시: Dockerfile 한 줄이 레이어 하나. 바뀌지 않은 레이어는 재사용
- 컨테이너 안의 `localhost`는 컨테이너 자신
  - 노트북에서 실행할 땐 `localhost:3307`이 Docker MySQL로 가는 통로였지만, 백엔드가 컨테이너에 들어가면 출발점이 바뀜
  - 컨테이너에서 노트북을 가리킬 땐 `host.docker.internal`
  - 설정 파일은 노트북용 그대로 두고, 실행 시 `-e`로 덮어씀 (환경변수가 설정 파일보다 우선)
- `.gitignore`와 `.dockerignore`는 별개
  - `.gitignore`: GitHub에 올리지 않을 파일
  - `.dockerignore`: Docker 빌드 재료로 넘기지 않을 파일
  - Maven은 둘 다 상관없이 `src/main/resources`를 전부 jar에 넣음

## 설계 판단: jar를 어디서 만들 것인가

v1 방식(노트북이나 CI에서 jar를 만들고 Dockerfile은 복사만)과 멀티 스테이지(Dockerfile 안에서 소스 빌드까지) 중 고민.

- 이전 팀 프로젝트의 백엔드 Dockerfile 확인 결과, v1과 같은 방식
  - Jenkins가 먼저 `gradlew bootJar`로 jar 생성 → `docker build`
  - jar 생성은 CI 서버 책임, Dockerfile은 단순하게 유지
- 코스콕도 GitHub Actions에서 jar를 만들 예정이라 v1 방식 유지
- 멀티 스테이지는 CI 없이 어디서든 Dockerfile만으로 빌드해야 할 때 고려

## 발견한 문제: 비밀 설정 파일이 jar에 포함됨

- jar 내부 확인 결과 `BOOT-INF/classes/application-secret.properties` 포함
- 원인: Maven은 `src/main/resources`의 파일을 전부 jar에 넣음. `.gitignore`는 빌드와 무관
- 위험: 이미지를 레지스트리에 올리면 받은 사람이 파일을 꺼내 볼 수 있음
- 대응
  - CI에서 빌드하면 비밀 파일이 저장소에 없으므로(.gitignore) jar에 안 들어감
  - 노트북에서 만든 이미지는 외부 레지스트리에 올리지 않기
  - 비밀값은 실행 시점에 환경변수로 주입 (`optional:` import)

## 트러블슈팅

### Dockerfile 내용을 터미널에 입력

- 증상: `FROM`을 터미널에 입력 → 명령어 없음
- 원인: Dockerfile 문법은 파일에 적는 내용. 터미널 명령어가 아님
- 배운 점: 터미널 명령은 프로그램 이름(`docker`, `git`, `.\mvnw.cmd`)으로 시작

### COPY 경로 오타

- 증상(빌드 전 발견): `CoureKok-...jar` (s 누락)
- 배운 점: COPY 경로가 틀리면 빌드 시 `not found`. 파일명은 `target` 폴더에서 직접 확인

## 다음에 할 것

- [ ] Docker Compose로 백엔드 + DB 묶기
  - 컨테이너끼리 서비스 이름으로 통신 → `host.docker.internal` 우회 제거
  - 볼륨으로 DB 데이터 유지
- [ ] `KakaoMobilityClient.java` 하드코딩 키 제거
- [ ] 나중에 Flyway 도입 검토 (`ddl-auto=update`로 생긴 테이블이 DDL 파일에 없음)
