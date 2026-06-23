---
name: develop-slice
description: Implement one vertical feature slice in Admissions OS with planning, verification, and roadmap updates.
---

# Develop one vertical slice

1. 루트 `CLAUDE.md`와 관련 하위 `CLAUDE.md`를 확인한다.
2. `docs/development/roadmap.md`에서 현재 Phase와 완료 조건을 확인한다.
3. 관련 도메인 타입, API 계약, 서버 처리, UI 흐름을 순서대로 조사한다.
4. 제품·구조 결정이 필요하면 구현 전에 사용자에게 추천안과 영향을 설명한다.
5. 타입 → 규칙 → 계약 → 서버 → UI 순서로 필요한 최소 범위만 구현한다.
6. `pnpm verify`를 실행하고 생성된 episode report의 실패를 수정한다.
7. roadmap과 관련 문서를 실제 상태에 맞게 갱신한다.
8. 변경, 검증, 미검증, 다음 의사결정 항목을 보고한다.
