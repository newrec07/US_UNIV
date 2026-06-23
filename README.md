# Admissions OS

학생의 미국 대학 입시 데이터를 바탕으로 객관적 현황과 근거 기반 분석을 제공하고,
지금 실행할 1~3개의 행동으로 번역하는 가족용 웹 애플리케이션입니다.

## 예정 구조

- `apps/web`: Next.js Dashboard + Messenger
- `apps/api`: NestJS application API
- `apps/agent-worker`: Claude orchestration worker
- `packages/domain`: 순수 TypeScript 도메인 타입과 규칙
- `packages/contracts`: API·이벤트·Agent tool 계약
- `packages/database`: Prisma schema와 database client
- `packages/testing`: fixture와 테스트 도우미
- `docs`: 제품·아키텍처·개발·결정 기록

현재는 도메인 설계와 규칙 엔진을 실행 가능한 monorepo 구조로 이전하는 단계입니다.
진행 상태는 `docs/development/roadmap.md`를 확인하세요.
