# Why — Admissions OS가 지금의 구조가 된 이유

이 문서는 프로젝트 초기 대화에서 무엇을 결정했고, 무엇을 실제로 구현했으며,
어떤 기준으로 현재 구조를 만들었는지를 한곳에 정리한 인수인계 문서다.

현재 구현 기준일은 **2026년 6월 23일**이다.

---

## 1. 프로젝트가 해결하려는 문제

Admissions OS는 미국 대학 입시를 준비하는 가족을 위한 비공개 AI 컨설팅 웹앱이다.
초기 사용자는 학생 2명과 부모 2명이다.

일반적인 입시 대시보드는 점수, 달성률, 위험도, 마감 목록을 많이 보여준다.
이 프로젝트는 그 방식이 학생에게 감독받는 느낌과 불필요한 스트레스를 줄 수 있다고 본다.

그래서 핵심 목표를 다음처럼 정했다.

> 학생의 객관적 상태와 근거를 분석하되, 첫 화면에서는 지금 실행할 수 있는
> 1~3개의 작은 행동으로 번역한다.

빈 데이터 역시 실패나 빨간 점수로 표현하지 않는다.
“아직 입력하지 않았다”는 상태는 “여기서 시작하자”는 행동으로 바꾼다.

---

## 2. 확정된 제품 원칙

### 행동 가이드이지 점수판이 아니다

- 첫 화면에는 행동 1~3개만 우선 노출한다.
- 행동은 가능한 한 30분 안에 시작하거나 완료할 수 있어야 한다.
- rating, risk, confidence, completeness는 삭제하지 않고 상세 상태와 근거로 제공한다.
- 학생은 모든 정보를 볼 수 있지만 원하지 않을 때 강제로 노출하지 않는다.

화면 정보는 세 단계로 구분한다.

- `action_layer`: 지금 할 행동
- `status_layer`: 현재 상태, 평가, 근거
- `system_layer`: 출처, 계산 버전, Agent 실행 정보

### 저장값과 계산값을 분리한다

- 변하고 궤적이 중요한 값은 이력으로 저장한다.
- 현재값, 추세, 우선순위는 가능한 한 이력에서 계산한다.
- `nextBestAction`, 현재 학년, admissions cycle은 저장하지 않고 계산한다.
- 각 영역은 상태를 소유하고 학생 행동은 단일 `Action[]` 큐가 소유한다.

### 객관적 사실과 학생별 관계를 분리한다

- 대학의 학비, 정책, 공개 통계는 공유 `College` 엔티티에 둔다.
- 학생별 전공, 비용 추정, 선호 관계는 `StudentCollege`에 둔다.
- 관계는 이름이 아니라 ID로 연결한다.
- 시험 일정 같은 외부 일정도 공유 `AdmissionsCalendar`로 관리한다.

### 출처와 신뢰도를 추적한다

- 학생 입력, 부모 입력, 공식 문서, 웹 조사, Agent 추론을 구분한다.
- 변동 데이터에는 기준 연도와 확인 시점을 기록한다.
- Agent 추론을 사용자나 공식 문서가 확인한 사실처럼 취급하지 않는다.
- LLM이 기억만으로 대학 정책, 일정, 금액을 채우지 않도록 한다.

### 합격·불합격을 예측하지 않는다

- 개인별 합격 확률을 제공하지 않는다.
- 합격 또는 불합격 판정 기능을 만들지 않는다.
- `StudentCollege.admitChance`를 제거했다.
- `reach/target/safety` 역시 합격 예측처럼 오해될 수 있어 현재 모델에서 제거했다.

대신 다음을 제공한다.

- 대학이 공개한 객관적 입시 현황
- 학생의 학업, 시험, 활동, 일정, 재정 상태
- 근거가 연결된 강점과 빈 곳
- 대학별 학업·선호·재정 조건 비교
- 지금 실행할 다음 행동

### 인구통계는 맥락이지 쿼터가 아니다

- 인종 쿼터나 인종 기반 합격 공식을 모델링하지 않는다.
- 학생의 인구통계는 선택적 자기보고 맥락이다.
- 대학의 공개 등록자 분포는 출처가 있는 참고 정보로만 사용한다.

---

## 3. 왜 서버 중심 구조인가

웹에는 Dashboard와 Messenger가 함께 존재해야 한다.
사용자가 Messenger에서 질문하거나 결정을 내리면 그 결과가 서버 데이터에 반영되고,
Dashboard도 같은 상태를 보여줘야 한다.

이 요구 때문에 Next.js 안에 모든 기능을 넣는 단일 앱 대신 다음 구조를 선택했다.

```text
Web Dashboard + Messenger
           │
           │ REST / SSE
           ▼
Application API ───────── PostgreSQL
           │
           ├───────────── Redis + BullMQ
           │                       │
           └───────────────────────▼
                              Agent Worker
                              Claude tool loop
```

### `apps/web`

- Next.js 기반 Dashboard와 Messenger
- 서버 상태를 표현하고 사용자 입력을 전달
- Claude API와 데이터베이스에 직접 접근하지 않음
- Agent 응답과 상태 변경을 SSE로 수신

### `apps/api`

- NestJS 기반 업무 API
- 모든 영속 데이터와 업무 규칙의 변경 관문
- 인증, 입력 검증, transaction, 감사 기록 담당
- Agent 작업을 Queue에 등록

### `apps/agent-worker`

- NestJS standalone worker
- BullMQ 작업과 Claude tool-use loop 실행
- DB에 직접 접근하지 않음
- API가 제공한 제한된 도구로만 데이터를 읽고 변경안을 제안

### 사용자 결정 반영

Agent의 자연어 답변이 곧바로 데이터 변경이 되지 않는다.

```text
사용자 메시지
→ 서버 저장
→ Agent 실행
→ 답변 또는 ProposedCommand 생성
→ 사용자에게 정확한 변경 내용 확인
→ API 검증과 transaction
→ dataVersion 증가와 파생값 재계산
→ Dashboard 갱신
```

이 구조는 Agent의 권한을 제한하고 사용자 승인과 실제 변경을 감사할 수 있게 한다.

---

## 4. 선택한 기술 기준

현재 확정된 방향:

- Workspace: pnpm workspaces
- Language: TypeScript strict mode
- Web: Next.js
- API: NestJS
- Agent Worker: NestJS standalone application
- Database: PostgreSQL
- ORM: Prisma
- Queue: Redis + BullMQ
- Runtime validation: Zod 예정
- Unit/integration test: Vitest
- Browser E2E: Playwright 예정
- LLM: Claude API를 Agent Worker에서 호출

현재는 도메인과 개발 하네스만 구성되어 있으며 Next.js, NestJS, Prisma, Redis 연결은
아직 생성하지 않았다.

---

## 5. 왜 Claude Code용 문서를 분리했는가

초기에는 제품 원칙, 아키텍처, 개발 절차, 로드맵, 테스트 기준이 하나의 큰
현재 `docs/archive/initial-development-plan.md`로 보존된 초기 개발 문서에 들어 있었다.

이 방식은 매 작업마다 불필요한 문서가 컨텍스트에 포함되어 토큰을 낭비하고,
현재 상태와 영구 원칙이 섞이는 문제가 있었다.

그래서 Claude Code가 작업 영역에 맞는 정보만 읽도록 다음처럼 분리했다.

```text
CLAUDE.md                         항상 필요한 최소 원칙
docs/product/                    제품과 도메인 기준
docs/architecture/               시스템 연결 구조
docs/development/                workflow, roadmap, quality gates
docs/decisions/                  확정된 결정과 이유
docs/archive/                    과거 설계 과정
apps/*/CLAUDE.md                 앱별 지침
packages/*/CLAUDE.md             패키지별 지침
.claude/rules/                   경로별 횡단 규칙
.claude/skills/                  필요할 때만 읽는 절차
```

루트 `CLAUDE.md`는 짧게 유지하고 상세 문서를 `@import`하지 않는다.
하위 `CLAUDE.md`와 path rule은 해당 영역을 작업할 때만 적용된다.

---

## 6. TypeScript 도메인 구조

기존의 950줄짜리 `student-schema.ts`를 도메인 책임별로 분리했다.

```text
packages/domain/src/
├── shared/          provenance, temporal, vocabulary
├── system/          System, User
├── student/         학생의 각 데이터 블록과 Action
├── college/         College, StudentCollege
├── timeline/        Timeline, Calendar, templates
└── rules/           결정적 계산 함수
```

`packages/domain`은 Next.js, NestJS, Prisma, Redis, Claude SDK에 의존하지 않는다.
앱과 인프라는 도메인을 사용할 수 있지만 도메인이 앱이나 인프라를 참조할 수는 없다.

현재 포함된 주요 도메인:

- 신원, 학교, 거주 상태
- 전공과 진로 관심
- 학기·과목·GPA
- 표준화 시험과 응시 이력
- 활동·리더십·대회·수상
- 재정 프로필과 선호
- 공유 대학 데이터와 학생별 대학 관계
- 근거 기반 Profile Assessment
- 단일 Action 큐
- Timeline, Calendar, milestone template
- System metadata와 completeness

---

## 7. 규칙 엔진에서 정리한 내용

기존 `computations.ts`를 함수 책임별 파일로 분리했다.

구현된 규칙:

- 졸업연도와 현재 날짜 기반 학년 계산
- 로컬 학년 변환
- GPA 참고 환산
- Action 우선순위
- completeness
- admissions cycle
- net price 추정
- experimental SAI placeholder

함께 수정한 문제:

- `GRADE_8 as any`를 제거하고 `PRE_HIGH_SCHOOL`로 명시
- 알 수 없는 GPA 체계를 미국 GPA처럼 그대로 통과시키지 않음
- 현재 시각을 함수 인자로 받도록 변경
- Action 우선순위 동점 규칙 추가
- net price 입력 범위 검증 추가
- 잘못된 공식 위험이 있는 SAI 계산을 `experimental` 모듈로 격리

SAI 모듈은 운영용 계산기가 아니다. 연도별 공식 FAFSA 계산식으로 교체하기 전에는
사용자 재정 결정에 사용하면 안 된다.

---

## 8. 테스트 데이터 처리 기준

Stanford, Northeastern, Georgia Tech 샘플 데이터는 운영 대학 데이터가 아니라
재정 구조가 다른 시나리오를 시험하기 위한 fixture다.

따라서 다음 위치로 이동했다.

```text
packages/testing/src/fixtures/colleges.ts
```

현재 수치는 실제 기능 구현 전에 필드별 공식 URL, 기준 연도, 확인일을 다시 검증해야 한다.
운영 reference data와 테스트 fixture를 섞지 않는다.

---

## 9. 자체 검증 하네스

Claude가 “완료했다”고 말하는 것보다 실행 증거가 남는 것을 기준으로 삼기 위해
프로젝트 전용 하네스를 만들었다.

### 검증 스크립트

```text
scripts/harness/Check-ArchitectureBoundaries.ps1
scripts/harness/Invoke-HarnessVerification.ps1
```

검증 항목:

- JSON 설정 파싱
- monorepo 아키텍처 경계
- Node.js와 pnpm 실행 환경
- TypeScript strict typecheck
- Prettier
- Vitest

각 실행은 다음 보고서를 만든다.

```text
.harness/runs/<episode-id>/report.json
.harness/state/latest-report.json
```

보고서에는 환경, 작업 ID, 변경 파일, 실행 결과와 실패 분류가 들어간다.
사용자 프롬프트와 학생·재정 데이터는 기록하지 않는다.

### Claude Code hooks

- `PreToolUse`: `.git`, 비밀 `.env`, lockfile 직접 편집 차단
- `PostToolUse`: 변경 파일 기록과 가능한 경우 Prettier 실행
- `Stop`: 변경이 있으면 전체 검증

Node.js 또는 pnpm이 없는 환경에서는 manual verification이 `environment` 실패를 남긴다.
무한 Stop loop를 피하기 위해 이 상태에서는 종료를 강제 차단하지 않는다.
두 실행 파일이 PATH에서 발견되면 Stop 검증이 강제된다.

### Subagents

- `domain-reviewer`: 도메인 내구성, 출처, ID 참조, 행동 번역 검토
- `verification-runner`: 소스를 수정하지 않고 하네스 실행과 증거 보고

---

## 10. 프로젝트 스킬

Claude Code가 필요할 때만 상세 절차를 읽도록 프로젝트 스킬을 만들었다.

### `$develop-slice`

하나의 수직 기능을 타입부터 UI와 검증까지 완성하는 절차.

### `$domain-change`

도메인 구조 변경 시 저장값·파생값, 이력, ID 관계, provenance, migration 영향을 검토.

### `$verify-change`

결정적 검증 하네스를 실행하고 episode report를 읽는 수동 검증 절차.

### `$review-code-quality`

정확성, 도메인 무결성, 타입과 계약, 아키텍처, 테스트, 유지보수성을 순서대로 검토.
주관적 스타일보다 실제 장애와 유지비용이 있는 문제만 보고하도록 설계했다.

### `$review-security`

다음 영역을 중심으로 위협 모델과 실제 공격 경로를 검토한다.

- 인증과 객체 단위 권한
- 입력 검증과 injection
- Agent tool-use와 prompt injection
- `ProposedCommand` 승인 무결성
- 미성년자·가족 재정정보
- REST, SSE, Redis Queue
- PostgreSQL과 migration
- 브라우저 보안과 비밀정보
- 의존성, 비용 제한, 운영 로그

---

## 11. 확정된 ADR

### ADR-001 — 가족 4명용 비공개 v1

다중 가족 SaaS의 조직·결제·테넌트 복잡성보다 핵심 입시 흐름을 먼저 검증한다.

### ADR-002 — 서버 중심 시스템

Web은 화면, API는 데이터와 변경 관문, Agent Worker는 Claude orchestration을 담당한다.

### ADR-003 — 민감 원본 문서 저장 보류

구조화된 데이터와 대화는 서버에 저장한다. 세금 신고서와 성적표 원본은 저장 목적,
암호화, 보존, 삭제 정책을 결정하는 별도 기능으로 구현한다.

### ADR-004 — 합격·불합격 예측 없음

개인별 확률을 만들지 않고 객관적 현황, 분석 근거, 다음 행동에 집중한다.

---

## 12. 현재 실제 완료 상태

완료:

- Claude Code용 루트·하위 instruction 구조
- 제품·아키텍처·workflow·roadmap·ADR 문서 분리
- pnpm monorepo 골격
- TypeScript 도메인 타입 분할
- 주요 규칙 함수 분할과 일부 단위 테스트
- 테스트 fixture 분리
- path rules와 프로젝트 skills
- domain/verification subagent
- 보호·포맷·Stop hooks
- 검증 및 episode report 하네스
- 코드 품질과 보안 검토 스킬
- JSON과 아키텍처 경계의 정적 검사

미완료:

- Node.js와 pnpm 설치
- 실제 `pnpm install`
- strict typecheck와 Vitest 실행 통과
- Next.js Web 앱
- NestJS API와 Agent Worker
- PostgreSQL, Prisma, Redis, BullMQ
- Zod API·Agent 계약
- Claude API tool loop
- Messenger와 Dashboard
- 공식 FAFSA/CSS 계산 엔진
- 실제 대학 데이터 검증 파이프라인
- 인증, 배포, CI, 백업과 데이터 삭제

현재 최신 하네스 보고서는 런타임이 없어 `environment` 실패 상태다.
JSON 설정과 아키텍처 경계 검사는 통과했다.

---

## 13. 다음 권장 순서

1. Node.js LTS와 pnpm 설치
2. `pnpm install`
3. `pnpm verify` 실행
4. typecheck와 테스트 오류 수정
5. Phase 0 완료 선언
6. Next.js Web, NestJS API, Agent Worker 생성
7. PostgreSQL·Prisma와 Redis·BullMQ 연결
8. 첫 수직 기능으로 Messenger 질문 저장 → AgentRun Queue 등록 → 상태 표시 구현

새 기능은 가능한 한 `$develop-slice`로 진행하고, 도메인 변경에는 `$domain-change`,
완료 전에는 `$review-code-quality`, 민감 데이터·API·Agent 변경에는 `$review-security`,
마지막에는 `$verify-change`를 사용한다.

---

## 14. 기준 문서

- Claude Code 기본 지침: `CLAUDE.md`
- 제품 철학: `docs/product/vision-and-principles.md`
- 도메인 모델: `docs/product/domain-model.md`
- 서버 구조: `docs/architecture/system-overview.md`
- 개발 절차: `docs/development/workflow.md`
- 현재 로드맵: `docs/development/roadmap.md`
- 품질 기준: `docs/development/quality-gates.md`
- 결정 기록: `docs/decisions/`
- 검증 하네스: `harness/README.md`
- 초기 설계 기록: `docs/archive/`

이 문서는 전체 맥락을 빠르게 이해하기 위한 요약이다. 세부 기준이 충돌하면 위 기준 문서와
실제 타입·테스트를 확인하고, 제품 또는 구조 결정이 달라지는 경우 사용자 승인을 먼저 받는다.
