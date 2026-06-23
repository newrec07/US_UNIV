# Contracts package

API DTO, SSE event, Agent tool 계약을 Zod 런타임 검증 스키마로 둔다.

현재 포함:

- `action/action.schema.ts` — `@admissions/domain`의 `Action`을 그대로 검증하는 조회 스키마.
  Agent가 제안하는 Action 초안과 API 조회 응답 양쪽에 사용한다.
- `action/action-command.schema.ts` — `@admissions/domain`의 `ActionCommand`(`accept_action`/
  `start_action`/`complete_action`/`dismiss_action`)를 검증하는 discriminated union.
  명령의 plain TS 타입은 domain에 있고, 이 스키마는 그 타입을 그대로 검증한다.
- `messenger/message.schema.ts` — `@admissions/domain`의 `Message`를 검증하는 조회 스키마.
- `messenger/message-command.schema.ts` — `send_message` 명령. `senderType`/`senderUserId`는
  인증 세션에서 서버가 채우므로 클라이언트 입력에서 받지 않는다(보내도 무시된다).
- `messenger/agent-run.schema.ts` — `@admissions/domain`의 `AgentRun`을 검증하는 조회 스키마.
  AgentRun은 API와 Agent Worker만 생성·전이하므로 명령 스키마는 두지 않는다.
- `messenger/proposed-command.schema.ts` — `@admissions/domain`의 `ProposedCommand`를 검증하는
  조회 스키마. `command`는 현재 `ActionCommandSchema`만 담는다.
- `messenger/proposed-command-decision.schema.ts` — `approve_proposed_command`/
  `reject_proposed_command` 사용자 결정 명령.
- `events/server-event.schema.ts` — SSE로 보내는 `ServerEvent` discriminated union
  (`message_created`/`agent_run_updated`/`proposed_command_created`/`action_updated`).
  각 이벤트는 변경분이 아니라 갱신된 엔티티 전체를 담아서, 클라이언트가 캐시를 그대로
  교체하면 되게 한다.

다음에 추가할 계약: 인증된 사용자 컨텍스트(DTO), College/StudentCollege 조회 스키마.

## `exactOptionalPropertyTypes`를 끈 이유

루트 `tsconfig.base.json`은 `exactOptionalPropertyTypes: true`를 강제하지만 이 패키지는
`false`로 덮어쓴다. zod의 `.optional()`은 `field?: T | undefined`로 추론되는데, 이를 도메인의
`field?: T` 타입에 그대로 대응시키면(`z.ZodType<DomainType>`) 구조적으로 항상 충돌한다.
실제 버그가 아니라 zod와 `exactOptionalPropertyTypes`의 알려진 타입 시스템 마찰이며,
런타임 검증을 거치는 계약 레이어에서만 완화한다. `packages/domain`의 규칙 함수는 영향받지 않는다.
