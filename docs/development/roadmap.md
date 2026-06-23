# 개발 로드맵

## 현재 상태

현재 Phase: **Phase 1 — 실행 가능한 monorepo** (세 앱 골격·Postgres/Redis 연결·CI 완료,
남은 항목은 BullMQ Queue/Worker — 처리할 진짜 Job이 생기는 Phase 3/4에서 함께 추가)

## Harness 상태

- [x] domain reviewer와 verification runner subagent
- [x] JSON·아키텍처 경계·typecheck·test 검증 스크립트
- [x] 편집 보호와 변경 파일 추적·포맷 hook
- [x] Stop verification과 episode report
- [x] Node.js와 pnpm 설치
- [x] 실제 `pnpm verify` 통과

## Phase 0 — 기준선 정리

- [x] Claude Code용 문서와 instruction 구조 설계
- [x] 루트·하위 `CLAUDE.md`, path rule, on-demand skill 배치
- [x] 기존 설계 문서를 목적별 문서와 ADR로 분리
- [x] `student-schema.ts`를 도메인 파일로 분리
- [x] `computations.ts`를 규칙 파일로 분리
- [x] `GRADE_8 as any` 제거
- [x] `StudentCollege.admitChance` 제거
- [x] Node.js, pnpm, TypeScript 환경에서 strict typecheck
- [x] 최초 단위 테스트 실행

완료 조건:

- [x] 문서와 타입의 핵심 구조가 일치한다.
- [x] `any` 없이 strict typecheck를 통과한다.
- [x] 알려진 위험 계산이 experimental로 격리되어 있다.

Phase 0 완료 (2026-06-22). `pnpm verify` 전체 통과 — json-configuration, architecture-boundaries,
runtime-prerequisites, typecheck, format-check, tests 모두 passed.

## Phase 1 — 실행 가능한 monorepo

- [x] Next.js Web 앱 생성 (`apps/web`: App Router, 첫 화면은 빈 Action을 "시작 행동"으로
      표현하는 자리표시자. API 연동은 이후 슬라이스에서 추가)
- [x] NestJS API 앱 생성 (`apps/api`: health check, `@admissions/database` 연결까지.
      비즈니스 컨트롤러는 이후 슬라이스에서 추가)
- [x] NestJS Agent Worker 생성 (`apps/agent-worker`: standalone application context로 부팅·종료만
      확인. BullMQ consumer와 tool-use loop는 이후 슬라이스에서 추가)
- [x] PostgreSQL + Prisma 연결 (`packages/database`: `User` 모델 1개, `@prisma/adapter-pg`
      드라이버 어댑터 사용. 나머지 도메인 엔티티의 영속 모델은 이후 슬라이스에서 추가)
- [x] Redis 연결 확인 (`apps/api`, `apps/agent-worker` 양쪽에 `ioredis` ping 기반
      연결 상태 확인. health check/부팅 로그로 노출)
- [ ] BullMQ Queue/Worker (실제 Job 정의·생산·소비 — 처리할 진짜 Job이 생기는
      Phase 3/4 슬라이스에서 추가)
- [x] Zod 계약과 SSE 이벤트 채널 구성 (Action/Message/AgentRun/ProposedCommand 조회·명령
      계약, `ServerEvent` SSE discriminated union까지 완료. 실제 SSE 전송·구독은
      NestJS API 생성 후 연결)
- [x] CI에서 typecheck와 테스트 실행 (`.github/workflows/ci.yml`: push/PR마다 install →
      typecheck → test → format:check → check:boundaries. GitHub remote(`newrec07/US_UNIV`)
      연결 후 실제 Actions 실행에서 통과 확인함 — 최초 실행은 Linux 러너에 `powershell`이
      없어 실패했고, architecture-boundaries 단계만 `pwsh`로 직접 실행하도록 고친 뒤 통과)

## Phase 2 — 규칙 엔진 신뢰성

- [ ] 학년과 admissions cycle 테스트
- [ ] Action 우선순위와 동점 정책
- [ ] completeness typed rule
- [ ] 타임라인 상태 계산
- [ ] GPA 참고 환산 검증
- [ ] 연도별 FAFSA SAI 공식 엔진
- [ ] CSS Profile 추정 엔진 분리
- [ ] net price 입력 검증과 버전 추적

## Phase 3 — Timeline과 Action 큐

- [ ] milestone template 데이터
- [ ] `generateTimeline()`
- [ ] 마감 접근 Action 생성
- [ ] 분기와 후속 일정 갱신
- [ ] 중복 Action 방지
- [ ] 첫 화면 1~3개 선택

## Phase 4 — 근거 기반 Agent

- [ ] Claude tool-use loop
- [ ] API 읽기 도구와 `ProposedCommand`
- [ ] Assessment runtime validation
- [ ] Evidence 참조 검사
- [ ] AgentRun과 prompt version 기록
- [ ] 사용자 승인과 감사 로그 연결

## Phase 5 — 대학·재정 비교

- [ ] 대학 데이터 수집·검증 파이프라인
- [ ] 전공·환경·선호 비교
- [ ] 학생별 net price scenario
- [ ] merit와 need-based aid 분리 표시
- [ ] 데이터 stale/unknown 처리

## Phase 6 — 최소 웹앱

- [ ] Messenger
- [ ] 오늘의 행동
- [ ] 학생 프로필
- [ ] Timeline
- [ ] 대학·비용 비교
- [ ] 상태·진단·근거 상세
- [ ] Agent 상태 표시

## Phase 7 — 보안·운영·배포

- [ ] 인증과 비밀정보 관리
- [ ] 저장·전송 암호화
- [ ] 데이터 내보내기·삭제
- [ ] 백업·복구
- [ ] 로그 개인정보 제거
- [ ] 외부 데이터 갱신 작업
