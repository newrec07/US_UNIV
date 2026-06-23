# 도메인 모델

TypeScript 타입이 도메인 구조의 기준이다. 데이터베이스, API 계약, LLM tool schema는
도메인 타입을 바탕으로 파생한다.

## 시스템 루트

```text
System
├── Student[]
├── College[]
├── User[]
└── AdmissionsCalendar[]
```

- `Student`: 학생별 상태와 관계
- `College`: 모든 학생이 공유하는 객관적 대학 데이터
- `User`: 초기 가족 4명
- `AdmissionsCalendar`: 시험일과 공식 일정 같은 공유 데이터

## Student aggregate

학생은 신원, 학문 방향, 학교 성적, 시험, 활동, 재정·선호, 진단, 시스템 메타를 소유한다.
추가로 `StudentCollege[]`, `MasterTimeline`, 단일 `Action[]` 큐, `Message[]` 대화 이력,
`AgentRun[]` 실행 이력, `ProposedCommand[]` 승인 대기열, 공유 어휘를 소유한다.

`Message`는 학생 전용이 아니라 학생을 중심으로 학생·부모·Agent가 같은 내용을 보는 단일
스레드다(원칙 1 — 모든 가족 구성원이 같은 정보를 본다). `senderUserId`로 어떤 `User`가
보냈는지 ID로 참조하고, `agentRunId`는 이 메시지를 만들거나 처리한 `AgentRun`을 가리킨다.

`AgentRun`은 하나의 Agent 실행을 나타낸다. `triggeredByMessageId`로 이 실행을 발생시킨
질문을, `resultMessageId`로 Agent의 답변 메시지를 ID로 참조한다. `dataVersionAtStart`는
실행을 큐에 넣은 시점의 `SystemMeta.dataVersion`을 기록해서, 실행 중 다른 변경이 끼어들었는지
나중에 비교할 수 있게 한다. `promptVersion`은 어떤 시스템 프롬프트로 만들어진 답변인지
감사할 수 있게 기록한다(Why.md 9절 — 실행 증거 기준). Messenger는 Dashboard의 action/status/system_layer
구분과는 별개의 채널이라 그 표에는 포함하지 않는다.

`ProposedCommand`는 Agent가 만든 변경 제안과 사용자 승인 사이의 대기 상태를 영속한다
(ADR-002 — Agent의 자연어 답변은 바로 데이터 변경이 되지 않는다). `command` 필드는
오늘은 `ActionCommand`만 담을 수 있다 — Agent가 제안할 수 있는 변경이 현재 Action
상태 전이뿐이기 때문이며, 다른 도메인(재정 프로필 등)에 제안 기능이 필요해지면
`command`의 타입을 넓힌다. `basedOnDataVersion`은 제안을 만들 때 근거로 삼은
`SystemMeta.dataVersion`이다 — 사용자가 승인하려는 시점에 데이터가 이미 바뀌었으면
`expired`로 전이시켜 오래된 근거로 변경이 적용되는 것을 막는다. 이 판정은
`rules/proposed-command-staleness.ts`의 `isProposalStale(proposal, currentDataVersion)`
순수 함수로 계산한다(저장하지 않음) — API가 승인을 처리하기 전에 호출해 `true`면
승인을 막고 `status`를 `expired`로 전이시킨다. `decidedByUserId`로 누가 승인·거절했는지
ID로 남긴다.

## 저장값과 파생값

저장하지 않고 계산하는 값:

- 현재 표준 학년: `graduationYear + today`
- GPA와 진단 추세
- `nextBestAction`
- admissions cycle
- 일정의 현재 상태

이력으로 저장할 값:

- 학교·학기·과목 성적
- 시험 응시
- 활동 성장 milestone
- 진단 snapshot
- Messenger 대화 (`Message[]`)

`Action[]`, `AgentRun[]`, `ProposedCommand[]`은 배열 자체가 이력이다(완료·실패·거절된
항목도 지우지 않고 남긴다). 다만 개별 레코드의 `status`는 in-place로 바뀌고 마지막
전이 시점만(`statusChangedAt`, `startedAt`/`completedAt`, `decidedAt`) 보존한다 — 모든
중간 상태 전이를 별도 레코드로 남기지 않는다. 전체 전이 로그가 필요해지면(예: 재시도
추적) 별도 구조로 확장한다.

## 참조 무결성

- `AcademicRecord.schoolId → School.id`
- `StudentCollege.collegeId → College.id`
- `Award.linkedCompetitionId → Competition.id`
- `Action.origin.entityId → 관련 도메인 엔티티`
- `Evidence.sourceRef → 근거 데이터`
- `AssessmentSnapshot.basedOnDataVersion → SystemMeta.dataVersion`
- `Message.senderUserId → User.id`
- `Message.agentRunId → AgentRun.id`
- `AgentRun.triggeredByMessageId → Message.id`
- `AgentRun.resultMessageId → Message.id`
- `ProposedCommand.agentRunId → AgentRun.id`
- `ProposedCommand.command.actionId → Action.id`
- `ProposedCommand.basedOnDataVersion → SystemMeta.dataVersion`
- `ProposedCommand.decidedByUserId → User.id`
- Timeline의 `dependsOn`, `unlocks → Milestone.id`

## 대학 관계

대학의 학비, 정책, 공개 통계는 `College`에 한 번만 저장한다.
학생별 전공, 비용 추정, 선호 적합성, 메모는 `StudentCollege`에 저장한다.

합격 가능성 예측 필드는 두지 않는다. 대학 목록의 균형을 표현하는 분류가 필요하면
객관적 목적과 명칭을 별도 결정한 뒤 추가한다.

## 진단과 행동

`ProfileAssessment`는 학생이 직접 작성하는 중복 입력이 아니라 Agent 또는 미래의 사람
컨설턴트가 다른 블록을 읽고 만드는 근거 기반 snapshot이다. 모든 dimension 진단에는
`Evidence[]`와 confidence가 필요하다.

진단 블록은 상태를 저장한다. 실행할 일은 진단 안에 넣지 않고 `Action[]` 큐에 추가한다.
`nextBestAction`은 저장하지 않고 큐에서 계산한다.

## 재정 모델

재정은 두 영역으로 나눈다.

- 가족 재정 정량화: FAFSA SAI와 향후 CSS Profile 추정
- 대학별 매칭: COA, need-based grant, merit, self-help, gap, net price

grant, merit, 대출·근로를 하나의 지원금으로 합치지 않는다. 계산 결과에는 공식 버전,
기준 연도, 입력 출처, 신뢰도와 제한을 기록한다.

## 출처와 신뢰도

중요 데이터는 source, confidence, 기준 시점, 외부 원문 URL을 가능한 한 추적한다.
`agent_inferred`는 사용자 또는 공식 문서가 확인한 값과 구분한다.

`Message`와 `AgentRun`은 학생 프로필에 대한 주장(claim)이 아니라 활동 로그이므로
`Provenance`/`DataConfidence`를 두지 않는다. 대신 그 자체로 출처 역할을 하는 필드를
가진다 — `Message.senderType`/`senderUserId`가 누가 말했는지, `AgentRun.modelUsed`/
`promptVersion`이 어떤 모델·프롬프트가 만들었는지를 기록한다. 이 로그에서 도출한
프로필 주장(예: Agent가 메시지를 읽고 만든 `DimensionAssessment`)에는 별도로
`Provenance`를 채운다.

## 표현 계층과 도메인 타입의 매핑

`docs/product/vision-and-principles.md`의 `action_layer` / `status_layer` /
`system_layer` 구분은 다음 도메인 타입에 대응한다. 새 타입을 추가할 때는 어느
계층에 속하는지 먼저 정하고, 해당 타입에 계층을 명시하는 주석을 남긴다.

| 계층           | 도메인 타입                                                               | 위치                    |
| -------------- | ------------------------------------------------------------------------- | ----------------------- |
| `action_layer` | `Action`                                                                  | `student/action.ts`     |
| `status_layer` | `ProfileAssessment`, `DimensionAssessment`, `AssessmentSummary`           | `student/assessment.ts` |
| `status_layer` | `SectionCompleteness`                                                     | `student/meta.ts`       |
| `system_layer` | `SystemMeta`(schemaVersion, dataVersion, lastAgentRunAt), `DataSourceLog` | `student/meta.ts`       |

`Action`은 학생이 지금 할 일만 표현하므로 `rating`, `confidence` 같은
status_layer 필드를 갖지 않는다. 화면이 행동의 근거를 보여줘야 하면
`Action.origin`으로 `status_layer`(예: `DimensionAssessment`)를 참조한다.
