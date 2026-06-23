# Web application

Next.js 기반 Dashboard와 Messenger 클라이언트다.

- 서버 상태를 표현하며 학생 데이터의 기준이 되지 않는다.
- Claude API, DB, Queue에 직접 접근하지 않는다.
- 조회와 명령은 API 계약을 사용한다.
- Agent 응답·실행 상태·데이터 갱신은 SSE로 수신한다.
- 첫 화면에는 1~3개의 원자적 행동만 우선 노출한다.
- rating, risk, completeness는 상세 상태 화면에서 근거와 함께 보여준다.
- 빈 상태는 실패 표시가 아니라 시작 행동으로 연결한다.
