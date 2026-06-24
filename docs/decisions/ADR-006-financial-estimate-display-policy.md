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
- `sai-formula-a-2025-26.ts`: 미국 교육부 Federal Student Aid가 발표한 "2025-26 Student Aid
  Index (SAI) and Pell Grant Eligibility Guide, Version 1"의 Formula A(부양 학생) 표를 그대로
  옮겨 구현했다(Table A1 payroll tax allowance, A2 income protection allowance, 사업/농장
  net worth 조정표, A5 parents' contribution bracket, 학생 income protection allowance와
  분담률). 다만 입력 매핑에서 다음을 단순화했고, 그래서 `usableForFinancialDecision`은 여전히
  `false`다 — 출처 표는 공식이지만 입력 단순화가 남아 있다:
  - "근로소득(earned income from work)"을 AGI로 근사한다(실제로는 다를 수 있음).
  - 학생 본인의 세금 납부액은 0으로 근사한다.
  - separated/MFS 가구는 부모 소득을 분리하지 않고 단일 filer 표를 그대로 쓴다.
  - `Household.homeEquity`는 주거용 집 지분으로 보고 SAI 자산에서 제외하고,
    `Household.realEstateEquity`는 기타 부동산으로 보고 포함한다.
  - 이 단순화를 없애려면(예: 근로소득을 AGI와 별도로 입력받기) 도메인 타입을 더 확장해야 한다 —
    다음 슬라이스로 미룬다.
- CSS Profile은 College Board가 정확한 산출 공식을 공개하지 않는 "Institutional Methodology"라
  학교마다 다르게 적용된다 — "그 CSS Profile 공식"이라는 게 존재하지 않는다. 공개된 일반 원칙
  (선행 소득 평가 22% 등)만 가지고 흉내 내는 엔진은 실제 학교별 결과와 다를 수 있으므로, 지금은
  CSS Profile 추정 엔진을 만들지 않는다. 입력 데이터만 수집해서 학생에게 보여주거나(계산 없이),
  필요하면 별도로 "일반 IM 근사치, 학교별로 다를 수 있음" 경고를 더 강하게 단 별도 엔진을
  설계해야 한다 — 제품 결정이 필요하다.
