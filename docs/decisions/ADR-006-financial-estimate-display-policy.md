# ADR-006 — 재정 추정값 표시 정책

- 상태: Accepted
- 결정일: 2026-06-24

## 맥락

FAFSA SAI, CSS Profile 같은 재정 추정은 공식 연도별 공식과 변수표가 있어야 신뢰할 수 있다.
지금은 `experimental-sai-estimate.ts`처럼 데이터 흐름과 UI 개발을 위한 placeholder 계산만
있고, 공식 출처를 인용한 운영용 계산기는 없다. 이 추정값을 화면에 어떻게 보여줄지 정하지
않은 채 구현하면 거짓 정밀도로 보일 위험이 있다([[ADR-004-no-admission-prediction]]과 같은
종류의 위험).

## 결정

- 공식 출처가 확인되지 않은 재정 추정값은 **항상** 다음 두 가지를 함께 표시한다.
  - 신뢰도 표시: "대략적 추정"(`rough_estimate`) 같은 명시적 confidence 값.
  - 경고 문구: 공식 계산기로 대체되어야 한다는 점, 실제 재정 결정에 쓰면 안 된다는 점.
- 위 조건을 만족하지 못하는 한 `usableForFinancialDecision`(또는 동등한 플래그)은 `false`로
  고정한다.
- 공식 연도별 FAFSA SAI 공식이나 College Board CSS Profile 공식 변수표를 출처와 함께 확인하기
  전에는 "운영용" 계산기로 전환하지 않는다.

## 결과

- `experimental-sai-estimate.ts`는 이미 이 정책을 만족한다 — 그대로 유지하고 테스트만 추가한다.
- "연도별 FAFSA SAI 공식 엔진"과 "CSS Profile 추정 엔진"(로드맵 Phase 2)은 공식 출처 확인 전까지
  미구현 상태로 둔다. 구현하려면 먼저 해당 연도의 공식 발표 자료(출처·발표일)를 확인해야 한다.
- 향후 운영용 계산기를 추가할 때도 이 표시 정책(신뢰도 + 경고)을 그대로 적용한다.
