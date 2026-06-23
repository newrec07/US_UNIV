# ADR-002 — 서버 중심 시스템

- 상태: Accepted
- 결정일: 2026-06-22

## 맥락

웹에는 Dashboard와 Messenger가 필요하고, 대화에서 나온 사용자 의사결정이 영속 데이터와
화면에 반영되어야 한다. Agent가 브라우저나 DB에 직접 연결되면 권한, 검증, 감사가 분산된다.

## 결정

- Next.js Web은 화면과 상호작용을 담당한다.
- NestJS API가 영속 데이터와 업무 규칙의 유일한 변경 관문이다.
- Agent Worker는 Queue에서 실행하고 API 도구만 사용한다.
- PostgreSQL은 영속 데이터, Redis/BullMQ는 Agent job과 재시도를 담당한다.
- REST는 조회·명령, SSE는 응답·상태·갱신 이벤트에 사용한다.

## 결과

- Web과 Agent가 같은 서버 상태를 본다.
- 사용자 승인과 실제 변경을 감사할 수 있다.
- Agent Worker는 DB client에 의존할 수 없다.
