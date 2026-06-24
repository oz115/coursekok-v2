# 프로젝트 규칙 (Project-scoped Rules)

- **패키지 매니저 및 스크립트 실행 규칙**:
  - 패키지 설치: 반드시 `pnpm add`를 사용하고 `npm` 혹은 `npx`를 사용하지 마십시오.
  - 스크립트 실행: `pnpm <script>` (예: `pnpm dev`, `pnpm build`)를 사용하십시오.
  - 일회성 실행: `pnpm dlx`를 사용하십시오.
