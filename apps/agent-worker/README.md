# Agent Worker

NestJS standalone application (HTTP 서버 없음).

- `src/main.ts` — `NestFactory.createApplicationContext`로 부팅하고, `ioredis`를 통한 Redis
  연결 상태를 로그로 남긴 뒤 종료한다. BullMQ job consumer가 아직 없어서 지금은 부팅과
  Redis 연결 확인용 골격이다.
- Claude tool-use loop, BullMQ Worker(실제 Job 소비), API 클라이언트 연동은 처리할 진짜
  Job이 생기는 Phase 3/4 슬라이스에서 추가한다.
- `packages/database`를 의존성에 두지 않는다 — DB는 API를 통해서만 접근한다.
- 빌드/실행: `pnpm --filter @admissions/agent-worker build` 후 `start`(ADR-005와 동일한
  tsc 빌드 + dist 실행 패턴).
