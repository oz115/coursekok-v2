# 2026-10-14 프론트 Docker(Nginx)로 넣고 전체 실행

## 목표

- 프론트도 컨테이너로 넣어 `docker compose up` 한 줄로 코스콕 전체 실행
- Nginx로 화면 파일 제공과 `/api` 요청 전달을 함께 처리

## 구조

```
브라우저 ─▶ localhost(80) ─▶ [frontend: Nginx]
                              ├─ 화면 요청 → dist 파일
                              └─ /api 요청 → [backend:8080] → [db:3306]
```

- 브라우저는 항상 같은 주소(Nginx)와만 통신 → CORS 문제 없음
- 백엔드와 같은 방식: 노트북에서 빌드(`pnpm build` → dist) → 이미지에 복사

| | 백엔드 | 프론트 |
|---|---|---|
| 빌드 결과 | jar | dist 폴더 |
| 실행 환경 | Java(JRE) | Nginx |
| 비밀값/설정 주입 시점 | 실행할 때 (환경변수) | **빌드할 때** (`VITE_` 값이 파일에 박힘) |

## 한 것

### frontend/.env
```
VITE_API_BASE_URL=/api
VITE_KAKAO_MAP_KEY=<JavaScript 키>
```
- 주소 없이 `/api`만 두면 브라우저는 현재 사이트(Nginx)로 요청

### frontend/nginx.conf
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
- `try_files`: SPA는 `/mypage` 같은 실제 파일이 없음. 없으면 index.html을 주고 Vue Router가 화면 처리 → 새로고침 404 방지
- `proxy_pass http://backend:8080`: Compose 서비스 이름으로 백엔드 지정
- `proxy_set_header`: 원래 요청자 정보를 백엔드에 전달

### frontend/Dockerfile
```dockerfile
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html
EXPOSE 80
```
- Nginx 이미지가 실행 명령을 갖고 있어서 ENTRYPOINT 불필요

### frontend/.dockerignore
- `node_modules`(용량 큼, 불필요), `.env`(비밀값) 제외

### docker-compose.yml에 추가
```yaml
  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "80:80"
```

### 실행
```
cd frontend
pnpm build
cd ..
docker compose up -d --build frontend
```
- 서비스 이름을 붙이면 그 상자만 다시 빌드, 교체. 나머지는 그대로
- `up`은 바뀐 상자만 교체하므로 `down` 먼저 할 필요 없음

## 트러블슈팅

### API 요청이 CORS로 막힘
- 증상: `Access to fetch at 'http://localhost:8080/api/...' from origin 'http://localhost' has been blocked by CORS policy`
- 원인: `frontend/.env`에 예전 값 `VITE_API_BASE_URL=http://localhost:8080/api`가 남아 빌드에 박힘. 브라우저가 Nginx를 거치지 않고 백엔드로 직접 요청 → 다른 출처라 차단
- 해결: `VITE_API_BASE_URL=/api`로 변경 후 재빌드
- 배운 점
  - 요청을 보내는 건 Nginx가 아니라 브라우저. 브라우저는 프론트 코드에 적힌 주소로 보냄. Nginx는 자기한테 온 요청만 전달 가능
  - Vite 환경변수는 빌드 시점에 고정. 값을 바꾸면 반드시 다시 빌드

### 아이콘 모듈 로드 실패 (MIME text/html)
- 증상: `Failed to fetch dynamically imported module: http://localhost/assets/IconSparkles.vue`, `server responded with a MIME type of "text/html"`
- 원인: `KkIcon.vue`의 `import(/* @vite-ignore */ \`./${compName}.vue\`)`
  - `@vite-ignore`로 Vite가 빌드 때 아이콘 파일을 처리하지 않음
  - 실행 시 브라우저가 원본 `.vue` 파일을 요청 → dist에 없음 → Nginx `try_files`가 index.html 반환 → JS 자리에 HTML이 와서 거부
  - 개발 서버는 `.vue`를 요청 시점에 변환해 줘서 안 보였던 문제. 어떤 정적 호스팅에 올려도 똑같이 깨지는 코드
- 해결: `import.meta.glob('./Icon*.vue')`로 빌드 시점에 아이콘 파일 목록을 Vite에 알림
  ```js
  const iconModules = import.meta.glob('./Icon*.vue')
  return defineAsyncComponent(iconModules[`./${compName}.vue`])
  ```
- 배운 점: 개발 서버에서 된다고 빌드 결과도 되는 건 아님. 배포 전에 빌드 결과물로 실행해 봐야 하는 이유

## 알려진 문제

- 길찾기: `aiPlanner.js`가 Vite 개발 프록시(`/kakao-mobility`)로 카카오 API를 직접 호출. 빌드 결과엔 프록시가 없어 동작 안 함. REST 키도 브라우저에 노출됨 → 백엔드 `KakaoMobilityClient`로 돌릴 예정

## 다음에 할 것

- [ ] 길찾기 요청을 백엔드 경유로 변경
- [ ] EC2 서버 배포
