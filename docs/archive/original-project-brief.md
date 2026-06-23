# Original Project Brief — Admissions OS

> 이 문서는 **작업을 이어받는 Claude**를 위한 것이다.
> `student-schema.ts`는 스키마의 *형태*를 담지만, *왜 그 형태인지*는 여기 있다.
> **아래 결정들을 무심코 되돌리지 말 것.** 각 결정에는 이유가 있고, 대부분은
> 구조 점검(아래 방법론)을 거쳐 나온 것이다. 바꾸려면 그 이유를 먼저 읽어라.

---

## 0. 프로젝트가 무엇인가

미국 대학입시를 위한 **Agentic AI 컨설팅 웹앱**. Claude/GPT API로 학생의 전 입시
과정을 가이드한다. 단순 정보 대시보드가 아니라, "지금 무엇을 해야 하는가"를
쉽고 명확하게 안내하는 **행동 가이드**가 핵심 목표다.

- 사용자: 학생 2명 + 부모, 총 4명 규모. **권한 분리 없음 — 모두 동일 오픈.**
- 기준 페르소나: NZ(NCEA) 재학, 미국 영주권자, STEM 생명과학/pre-med 관심 학생.
  비미국 커리큘럼 + 영주권자라 변환·재정·국제 이슈가 모두 얽힘.
- 현재 완료된 것: **학생 데이터 스키마(`student-schema.ts`)**. TS 타입 검증 통과.
- 데이터 구조는 끝났으나 **에이전트 로직·빈 모듈·파생물은 미완**(§5 참조).

---

## 1. 절대 원칙 (모든 작업에 적용)

이 시스템 전체를 관통하는 두 축이다. 새 기능·새 필드를 만들 때 항상 통과시켜라.

### 원칙 1 — 행동 가이드이지 점수판이 아니다
> "달성률·진행률은 감독자의 언어다. 학생에게는 스트레스다."

- 모든 측정값(rating, risk, confidence, growthStage, completeness…)은
  학생에게 보일 때 **"다음 한 걸음"으로 번역**되어야 한다. 번역 안 되는 측정값은
  학생 첫 화면에 띄우지 마라.
- 노출은 **숨김이 아니라 깊이**로 나눈다: `action_layer`(첫 화면, 행동만) /
  `status_layer`(현황·rating·risk — 학생이 원할 때 봄) / `system_layer`(운영 메타).
  **학생은 전부 볼 수 있다. 들이밀지 않을 뿐이다.** (숨기면 블랙박스 명령이 됨)
- 첫 화면 행동은 **1~3개**. 행동은 **원자적**(30분 내 실행 가능)이어야 한다.
- 빈 곳은 **비난이 아니라 초대**다. `critical_gap`/`empty`/`NOT_STARTED`는
  빨간 0이 아니라 "여기서 시작하자"는 첫 행동으로 보여라.

### 원칙 2 — 구조 내구성 (유지비용 최소화)
> 나중에 "아! 이런 게 있었네" 하며 필드를 땜질하면 마이그레이션 폭탄이 된다.

- **값 추가는 안전, 구조 변경은 위험.** 늘어나는 종류(시험·활동·전공 등)는
  `(string & {})`로 열어 값만 추가되게 하고, 유한한 척도는 닫아라.
- **변하고·궤적이 의미있고·되돌아볼 값은 이력으로 쌓고, 추세·현재는 계산한다.**
  (GPA 추세, 활동 성장, 진단 trend가 모두 이 패턴. 저장하면 갱신 누락 시 거짓이 됨)
- **측정은 블록이, 행동은 단일 Action 큐가 전담.** 블록 안에 행동을 두지 마라.
- **객관 사실은 공유 엔티티로 정규화, 관계는 ID로 참조.**
- 모든 데이터는 **출처·신뢰(Provenance)** 를 추적한다. 특히 에이전트 추론값
  (`agent_inferred`)과 검증된 값을 구분하라. 환각이 부모의 실제 결정을 좌우한다.

---

## 2. 핵심 구조 결정 (되돌리지 말 것)

| # | 결정 | 이유 |
|---|------|------|
| D1 | **TS 타입이 마스터.** Prisma·JSON Schema는 여기서 파생 | 프론트/백/LLM 셋을 한 정의로 만족 |
| D2 | 시스템 루트 = `Student[]` + `College[]` + `User[]` (다중 최상위) | College 정규화 때문에 Student 단독에서 확장됨 |
| D3 | **College는 공유 엔티티**(객관 사실 한 벌), 학생은 `StudentCollege`로 관계만 보유 | 여러 학생 공유 + 대학 데이터는 수집비용 크고 매년 변함. 중복 저장 시 갱신 악몽 |
| D4 | **School은 학생 안(블록1)에 둠**, 단 `id` 부여 | 학교는 공유 적고 데이터 가벼움. 단 미래 공유 승격 자리 확보 |
| D5 | **Action은 Student 안 최상위 큐**(블록 밖) | 행동이 블록마다 흩어지면 우선순위를 못 매김. 한 큐에 모여야 "이거 하나" 선택 가능 |
| D6 | **nextBestAction은 저장 안 함 → 큐에서 계산** | 행동 완료/추가 시 자동으로 다음이 떠올라야 함 |
| D7 | **진단(블록7)은 학생 입력 아님 → 에이전트 생성** | 강약점은 이미 다른 블록에 데이터로 존재. 중복 입력 불필요 |
| D8 | 진단 주체 = `generatedBy: 'agent' | 'consultant'`, 기본 agent | LLM이 기본, 사람 컨설턴트는 나중에 붙일 자리만 |
| D9 | **학년(gradeStandard) 저장 안 함 → graduationYear+today로 계산** | 매년 바뀜. 졸업연도가 고정 기준점 |
| D10 | 인구통계: 학생 속성→블록1, 대학 분포→College. **"쿼터" 개념 금지** | 인종쿼터는 법적으로 부재(SFFA 2023, Bakke 1978). 공개 CDS 분포만 "참고"로 |
| D11 | 재정: 가족 정량화(SAI) + 대학별 매칭(merit/net price 분해) 두 엔진 | 성적으론 안 됐는데 merit로 전액 가는 케이스(노스이스턴)를 잡아야 함 |
| D12 | net price는 grant(안갚음)/merit/self-help(대출) **분해** | 뭉뚱그리면 실부담 왜곡. grant와 loan은 전혀 다름 |

---

## 3. 공유 요소 (여러 블록이 참조 — 함부로 블록 안에 가두지 말 것)

- **FieldClusterRef** (학문 계열): 표준값은 시스템 상수(`STANDARD_FIELD_CLUSTERS`),
  학생 자유값은 `student.vocabularies.customFieldClusters`에 등록 → 전 블록 재사용.
  블록2·3·4·5가 참조. 자유값을 블록 안에서만 만들면 다른 블록과 비동기 발생.
- **College** (공유 엔티티): 블록6·StudentCollege·미래 모듈이 `collegeId`로 참조.
- **DataSourceType / DataConfidence / Provenance**: 출처는 두 축으로 분리
  (출처=어디서, 신뢰=얼마나, 독립적). 모든 블록의 출처 필드가 이 어휘를 씀.
- **TimePoint<T> / Trend**: 이력이 필요한 새 값은 이 골격을 따르고 추세는 계산.

### 참조 무결성 (이름 아닌 ID로 연결 — 철자에 깨지지 않게)
- `AcademicRecord.schoolId` → `School.id`
- `StudentCollege.collegeId` / `CollegeFinancialFit` → `College.id`
- `Award.linkedCompetitionId` → `Competition.id`
- `Action.origin.entityId` → `"activity:{id}"`, `"dimension:{name}"` 등
- `Evidence.sourceRef` → 데이터로 점프하는 참조
- 블록7 `basedOnDataVersion` → 블록8 `dataVersion`

---

## 4. 점검 방법론 (새 블록·기능 추가 시 이 렌즈로 검수하라)

두 번에 걸쳐 전체를 점검했다. 새 작업물도 같은 기준을 통과시켜라.

**A. 행동 번역 점검** — "이 측정값이 다음 한 걸음으로 번역되는가?"
렌즈: ①측정→행동 변환 ②인지부하(1~3개) ③원자성(30분) ④빈 곳=초대 ⑤자동 우선순위
처분: (유지) / (번역레이어 추가) / (학생 첫화면에서 status_layer로 내림)

**B. 구조 내구성 점검** — "값만 추가하면 되나(안전), 구조를 뜯나(위험)?"
렌즈: ①enum 개폐 ②단수/복수 ③평면/중첩 ④시간축(스냅샷/이력) ⑤출처·신뢰 ⑥관계·참조(이름/ID)
처분: (견고) / (지금 유연화) / (의도적 보류 — 단 미래 추가가 안 깨지는 자리인지 확인)
> 핵심 함정: "모든 걸 미리 넣기"가 아니라 "나중에 추가해도 안 깨지는 구조". over-engineering 경계.

---

## 5. 아직 안 된 것 (다음 작업 후보)

### 5a. 에이전트 계산 로직 (구조만 있고 구현 없음)
- **SAI 계산 함수**: `FinancialProfile` 입력 → `estimatedSAI`. FAFSA/CSS 공식 필요(§6).
- **GPA 환산 + 변환 테이블**: NCEA/IB 등 → 미국 4.0. 학년 변환 테이블(NZ Year 11→GRADE_10).
  ⚠️ LLM에 맡기지 말고 결정적 테이블/함수로. 환산 신뢰도 동반.
- **nextBestAction 우선순위 계산**: `computeNextBestAction(actions)` —
  urgency × admissionsImpact × isFoundational × deadline 조합. **규칙 엔진으로, LLM은 설명만.**
- **진단 생성**: 블록들을 읽고 `ProfileAssessment` 생성. evidence 필수, 근거 없는 단정 금지.
- **completeness 계산**: 각 섹션 채움 정도 → 비면 행동 생성 트리거.

### 5b. 빈 모듈 (자리만 있고 본격 설계 안 함)
- **대학리스트 모듈**: `StudentCollege[]` 뼈대는 있음. reach/target/safety 분류 로직 미정.
- **에세이 개발 모듈**: 블록5 `learnings`/`motivation`이 story bank로 흐르게 설계됨.
  실제 에세이 종류(Common App, 보충, Why Major), 초안·피드백 루프 미설계.
- **타임라인/일정 모듈**: graduationYear 기준 전체 입시 사이클. Action 큐와 연동.
- **지원서 제출 모듈**: v1 보류 권장(Common App/UC 포털, 추천서, 재정서류).

### 5c. 파생물·인프라
- Prisma 스키마(또는 선택한 ORM), LLM tool calling용 JSON Schema — TS에서 파생.
- 통합 Action 큐 노출 레이어(action/status/system)의 실제 UI.
- 프로젝트 골격(폴더·파일 분할) — 아직 안 잡음.

### 5d. 아키텍처 미결정 (시작 전 정해야)
- **Claude vs GPT 역할 분담**: 처음엔 v1 단일 모델 + tool calling 권장(디버깅 단순).
  하나를 Orchestrator로 고정, 다른 하나는 특정 작업(에세이 피드백 등)에.
- **일정·우선순위 = 규칙 엔진 / 코칭·설명 = LLM** 하이브리드. 핵심 로직을 LLM에 맡기면
  매일 결과가 흔들림.
- 안전 가드레일: 출처 없는 합격가능성 수치 금지, 대학정보는 검증 데이터로,
  "모르면 모른다", 미성년 데이터 프라이버시.

---

## 6. 외부 지식·데이터 출처 (구조의 빈 칸을 채울 실제 내용)

⚠️ 이 값들은 **검색/검증으로 확인하라.** LLM 기억으로 채우지 말 것. 매년 변한다.

- **SAI 공식**: FAFSA(연방, IM 아님) + CSS Profile(약 400개 사립대, 주택자산·비양육부모 포함).
  2026-27 FAFSA는 2024 세금 사용. need = COA − SAI − 기타지원.
- **대학별 재정**: meetsFullNeed/avgNeedMetPct/gapping/merit aggressiveness.
  Common Data Set + 대학 공식 사이트. 자동수집 어려움 — 웹리서치로 채워야 함.
- **표준화 시험**: SAT/ACT/CLT(325+ 대학, FL·UNC 인정)/AP/IB(Yale test-flexible로 SAT 대체 가능)
  /TOEFL·IELTS·PTE·Duolingo/PSAT·PreACT. enum은 `(string & {})`로 열려 있으니 값 추가는 안전.
- **SFFA 2023**: 인종 기반 입학 위헌. 대학들이 socioeconomic 다양성·Pell·top X%·레거시폐지로 전환.
  학생은 에세이에서 자기 배경을 *경험으로* 쓸 수 있음(합법). 시스템은 "쿼터" 모델링 금지.

---

## 7. 작업 재개 시 체크리스트

1. `student-schema.ts`를 읽고 `npx tsc --noEmit --strict`로 타입 검증.
2. 새 필드/기능은 §4 두 점검(행동번역 + 구조내구성)을 통과시킨다.
3. §2 결정들과 충돌하지 않는지 확인. 충돌하면 그 결정의 이유부터 읽는다.
4. 공유 요소(§3)는 블록 안에 가두지 말고 참조로 연결.
5. 계산 로직은 규칙 엔진 우선, LLM은 설명·코칭. 외부 데이터(§6)는 검증.
