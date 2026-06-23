# Admissions OS

미국 대학 입시 전 과정을 지원하는 가족 4명용 비공개 AI 컨설팅 웹앱이다.

## 반드시 지킬 원칙

- 학생 첫 화면은 점수판이 아니라 지금 할 수 있는 1~3개의 행동을 보여준다.
- 측정값은 상태 근거로 보존하되 학생에게는 다음 행동으로 번역한다.
- 빈 데이터는 실패가 아니라 시작할 행동으로 표현한다.
- TypeScript 도메인 타입이 기준이며 DB·API·Agent 계약은 여기서 파생한다.
- 변하고 궤적이 중요한 값은 이력으로 저장하고 현재·추세는 계산한다.
- 모든 학생 행동은 학생별 단일 `Action[]` 큐에서 관리한다.
- 객관적 대학·일정 데이터는 공유 엔티티로 두고 관계는 ID로 참조한다.
- 외부 사실과 Agent 추론은 출처·기준 시점·신뢰도를 추적한다.
- 합격·불합격 확률 또는 개인별 예측값을 만들지 않는다.
- 인종 쿼터 또는 인종 기반 합격 공식을 모델링하지 않는다.

## 시스템 경계

- `apps/web`: Dashboard와 Messenger. 데이터의 기준이 아니다.
- `apps/api`: 모든 영속 데이터와 업무 규칙의 변경 관문이다.
- `apps/agent-worker`: Claude orchestration과 tool loop를 실행한다.
- Agent는 DB를 직접 읽거나 쓰지 않고 API가 허용한 도구만 사용한다.
- 중요한 데이터 변경은 `ProposedCommand`와 사용자 확인을 거쳐 반영한다.
- `packages/domain`은 Next.js, NestJS, Prisma에 의존하지 않는다.

## 작업 방식

1. 관련 코드를 먼저 읽고 필요한 상세 문서만 선택해 읽는다.
2. 구조·비용·개인정보·제품 정책이 바뀌면 구현 전에 사용자 결정을 받는다.
3. 작은 수직 기능 단위로 타입 → 구현 → 테스트 → 문서를 함께 갱신한다.
4. 작업 후 변경 범위에 맞는 typecheck와 테스트를 실행한다.
5. 검증하지 못한 항목은 완료라고 표현하지 않는다.

## 문서 지도

- 제품 원칙: `docs/product/vision-and-principles.md`
- 도메인 구조: `docs/product/domain-model.md`
- 서버 아키텍처: `docs/architecture/system-overview.md`
- 개발 절차: `docs/development/workflow.md`
- 현재 단계: `docs/development/roadmap.md`
- 품질 기준: `docs/development/quality-gates.md`
- 결정 이유: `docs/decisions/`
- 초기 설계 기록: `docs/archive/initial-design-log.md`

`@` import를 사용해 상세 문서를 모두 시작 컨텍스트에 넣지 않는다.

프로젝트 스킬:

- 코드 품질 검토: `$review-code-quality`
- 보안·위협 검토: `$review-security`
- 도메인 구조 변경: `$domain-change`
- 전체 검증: `$verify-change`

## 기본 명령

- 설치: `pnpm install`
- 타입 검사: `pnpm typecheck`
- 테스트: `pnpm test`
- 린트: `pnpm lint`
- 전체 검증: `pnpm verify`

현재 환경에서 명령을 실행할 수 없다면 이유를 보고하고 정적 검증 결과를 함께 제시한다.
