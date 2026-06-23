# Agent worker

NestJS standalone worker로 Claude orchestration과 tool loop를 수행한다.

- DB를 직접 읽거나 쓰지 않는다.
- API가 허용한 타입 안전 도구만 호출한다.
- 숫자·일정·우선순위는 도메인 규칙 결과를 사용한다.
- Claude는 근거 기반 설명, 코칭, 구조화된 변경 제안을 담당한다.
- 변경 제안은 `ProposedCommand`로 만들고 사용자 승인 뒤 API가 실행한다.
- 모든 실행은 모델, 프롬프트 버전, 데이터 버전, 상태, 오류를 기록한다.
- 합격·불합격 확률 또는 개인별 예측값을 생성하지 않는다.
