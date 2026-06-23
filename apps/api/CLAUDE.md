# Application API

NestJS 기반 데이터 및 업무 규칙의 유일한 변경 관문이다.

- 모든 외부 입력을 검증한다.
- 학생·대학·Action·Timeline 변경은 transaction으로 처리한다.
- 변경 시 `dataVersion`과 감사 정보를 함께 갱신한다.
- Agent 작업은 Queue에 등록하고 실행 상태를 저장한다.
- 중요한 Agent 변경 제안은 사용자 승인 전까지 적용하지 않는다.
- 도메인 규칙은 `packages/domain`을 사용하고 route/controller에 복제하지 않는다.
