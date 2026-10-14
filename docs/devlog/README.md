# CourseKok v2 개발 기록

Vue로 만든 코스콕을 Docker, 배포, CI/CD, React 전환까지 직접 해보며 남기는 기록.
원본 Vue 버전은 `v1-vue` 태그에 보존.

## 로드맵

| 단계 | 내용 | 상태 |
|---|---|---|
| 0 | Docker로 로컬 MySQL 띄우고 백엔드 연결 | 완료 (2026-10-13) |
| 1 | 백엔드 Dockerfile 작성, 이미지 빌드 | 완료 (2026-10-13) |
| 2 | Docker Compose로 백엔드 + DB 묶기 | 완료 (2026-10-14) |
| 2-1 | 프론트 Dockerfile 작성 (Nginx) | 완료 (2026-10-14) |
| 3 | Docker Compose로 프론트, 백엔드, DB 한 번에 실행 | 완료 (2026-10-14) |
| 4 | EC2 서버 배포 | 다음 |
| 4-1 | 프론트 Vercel 배포, Nginx 컨테이너 방식과 비교 | |
| 5 | GitHub Actions로 자동 배포 (CI/CD) | |
| 6 | React 전환, 반응형, 성능 개선 | |

## 기록 목록

- [2026-10-13 Docker로 MySQL 띄우고 백엔드 연결](./2026-10-13-docker-mysql.md)
- [2026-10-13 백엔드 Dockerfile 작성, 이미지로 실행](./2026-10-13-backend-dockerfile.md)
- [2026-10-14 Docker Compose로 백엔드 + DB 묶기](./2026-10-14-docker-compose.md)
- [2026-10-14 프론트 Docker(Nginx)로 넣고 전체 실행](./2026-10-14-frontend-docker.md)

## 기록 템플릿

```
# YYYY-MM-DD 제목

## 목표
## 한 것
## 배운 개념
## 트러블슈팅
- 증상 / 원인 / 해결 / 배운 점
## 다음에 할 것
```
