# API

NestJS application API.

- `src/main.ts` — bootstrap, 기본 포트 3001(`PORT` 환경변수로 변경 가능).
- `src/health/health.controller.ts` — `GET /health`. 서버 상태, `@admissions/database`를 통한
  DB 연결 상태, `ioredis`를 통한 Redis 연결 상태를 함께 반환한다.
- Redis는 연결 확인까지만 한다. 실제 BullMQ Queue(Job 생산)는 처리할 진짜 Job이 생기는
  슬라이스에서 추가한다 — `docs/development/roadmap.md` 참고.
- 빌드: `pnpm --filter @admissions/api build` (또는 루트 `pnpm build`) 후 `pnpm --filter @admissions/api start`.
- 개발: `pnpm --filter @admissions/api dev` (tsc watch + node --watch).
- `@admissions/database`는 컴파일된 `dist`를 통해 import하므로, database 패키지를 수정하면
  먼저 그 패키지를 다시 빌드해야 한다(루트 `pnpm build`가 의존성 순서대로 처리한다).
