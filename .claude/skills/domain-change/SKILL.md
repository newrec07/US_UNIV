---
name: domain-change
description: Review or implement Admissions OS domain schema changes and their migration impact.
---

# Domain change checklist

- 새 값이 열린 종류인지 닫힌 척도인지 판단한다.
- 값 추가로 충분한지 구조 변경이 필요한지 확인한다.
- 변하고 궤적이 중요한 값이면 이력으로 저장한다.
- 현재값·추세·우선순위는 가능한 한 계산한다.
- 관계는 이름이 아니라 ID로 연결한다.
- 출처, 기준 시점, 신뢰도 표현을 확인한다.
- 측정값이 학생의 다음 행동으로 번역되는지 확인한다.
- domain, contracts, database, fixture, migration, tests의 영향을 함께 검토한다.
- 기존 ADR과 충돌하면 새 ADR 또는 기존 ADR 수정안을 먼저 제시한다.
