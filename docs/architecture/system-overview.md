# 시스템 아키텍처

## 역할 분리

```text
Web Client
Dashboard + Messenger
        │ REST commands/queries
        │ SSE message/status/data events
        ▼
Application API ─────────── PostgreSQL
        │
        ├────────────────── Redis + BullMQ
        │                         │
        └─────────────────────────▼
                             Agent Worker
                             Claude tool loop
```

### Web

- Next.js 기반 Dashboard와 Messenger
- 서버 상태를 화면에 표현
- 사용자 메시지와 명시적 의사결정을 API에 전달
- Agent 응답과 데이터 갱신 이벤트를 SSE로 수신
- 영속 데이터, Claude 비밀키, Agent 도구를 소유하지 않음

### Application API

- NestJS 기반 system of record
- 인증, 입력 검증, 업무 규칙, transaction 담당
- 학생·대학·Action·Timeline 데이터의 유일한 변경 관문
- 질문과 의사결정을 Conversation/Message로 저장
- Agent 작업을 Queue에 등록하고 변경 이벤트 발행

### Agent Worker

- NestJS standalone worker
- BullMQ job 소비와 재시도
- 서버가 허용한 도구로 데이터와 규칙 결과 조회
- Claude API tool-use loop 실행
- 답변, 근거, 변경 제안을 서버에 저장
- DB에 직접 접근하지 않음

## Messenger 처리 흐름

```text
사용자 질문
→ API가 Message와 AgentRun 저장
→ Queue에 작업 등록
→ Worker가 API 도구로 데이터 조회
→ 규칙 결과와 근거를 Claude에 제공
→ 답변을 Messenger에 스트리밍
→ 변경이 필요하면 ProposedCommand 생성
→ 사용자가 승인
→ API가 검증 후 transaction 실행
→ dataVersion 증가와 파생값 재계산
→ Web이 이벤트를 받고 Dashboard 갱신
```

## 통신 원칙

- 일반 조회와 명령: REST
- Agent 응답 토큰, 실행 상태, 데이터 갱신 이벤트: SSE
- 장시간 작업과 재시도: Redis + BullMQ
- 영속 변경: API command + PostgreSQL transaction
- WebSocket은 실제 양방향 실시간 협업이 필요할 때 도입

## 패키지 의존 방향

런타임에 다른 패키지를 import할 때는 컴파일된 `dist`를 통해 소비한다(ADR-005).

```text
web ───────────────→ contracts
api ───────────────→ contracts, domain, database
agent-worker ──────→ contracts, domain, API tools
contracts ─────────→ domain
database ──────────→ domain
domain ────────────→ no framework dependency
```

금지:

- `domain → Next.js/NestJS/Prisma`
- `web → database`
- `agent-worker → database client`
- 브라우저에서 Claude API 직접 호출
