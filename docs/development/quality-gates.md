# 품질 기준

## 기본 검증

1. 포맷과 정적 분석
2. TypeScript strict typecheck
3. 변경 범위의 단위 테스트
4. API·DB 변경의 통합 테스트
5. 핵심 Web 흐름의 Playwright E2E
6. 참조 무결성 검사
7. 행동 번역 점검
8. 외부 사실의 기준 시점과 출처 검사

## 단위 테스트 대상

- 학년 경계: 7월/8월, 졸업 전후
- Action 우선순위: 마감, 영향도, foundational, 동점
- completeness: empty, partial, sufficient, complete
- net price: full need, gapping, merit, self-help
- 외부 데이터 없음, 오래됨, 상충함

## 참조 무결성

- `schoolId → School.id`
- `collegeId → College.id`
- `linkedCompetitionId → Competition.id`
- `nextBestActionId → Action.id`
- `sourceRef → 실제 엔티티`
- `basedOnDataVersion → meta.dataVersion`
- Timeline dependency와 unlock 참조

## 대표 fixture

1. NZ NCEA + 미국 영주권 + STEM/pre-med
2. 미국 공립고 + need-based aid 필요
3. IB 국제학생 + 영어시험 필요
4. 부모 이혼 + FAFSA/CSS 구조 차이
5. 시험·활동 데이터가 부족한 학생
6. merit 장학 가능성이 있는 학생

각 fixture에서 첫 화면 행동 수, 원자성, 근거 연결, 빈 상태 번역, 불확실성 표시를 확인한다.

## 외부 데이터

대학 정책, 시험 일정, FAFSA/CSS 공식, 학비, 공개 입시 통계는 변동 데이터다.

```ts
interface ExternalFactProvenance {
  sourceUrl: string;
  sourceTitle?: string;
  publisher: string;
  retrievedAt: string;
  effectiveYear?: string;
  confidence: 'official' | 'secondary' | 'estimated';
}
```

- 공식 기관과 대학 공식 사이트를 우선한다.
- 검색 결과 요약만 근거로 저장하지 않는다.
- 서로 다른 연도의 수치를 한 레코드에 섞지 않는다.
- 추정과 공식값을 같은 신뢰도로 표시하지 않는다.
- 갱신 주기가 지난 데이터는 경고하거나 판단에서 제외한다.
- 합격·불합격 확률이나 개인별 예측값은 생성하지 않는다.

## 완료의 정의

- 사용자 흐름이 동작한다.
- strict typecheck를 통과한다.
- 성공·실패·경계 테스트가 있다.
- 개인정보와 안전 위험을 검토했다.
- 외부 사실에 출처와 기준 시점이 있다.
- 측정 결과가 다음 행동으로 번역된다.
- 문서와 코드가 동기화되어 있다.
- 남은 제한과 불확실성을 명시했다.
