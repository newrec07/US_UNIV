import type { College } from '@admissions/domain';

// ============================================================================
// SAMPLE COLLEGES — 특성이 다른 3개 대학 (Top 50, 시스템 테스트용)
// ============================================================================
// 선정 기준:
//   1. Stanford: 초엘리트 사립, need-blind, 100% need met, merit 없음
//   2. Northeastern: 사립, 공격적 merit 장학 (노스이스턴 케이스), co-op, 100% need met
//   3. Georgia Tech: 최상위 공립 STEM, in-state/out-of-state 격차, 제한적 merit
//
// 페르소나(NZ 학생, US 영주권자) 관점:
//   - 영주권자 = domestic for aid → FAFSA/CSS 모두 가능
//   - 어느 주 거주자도 아님 → public은 out-of-state 적용
//   - 세 대학의 재정 구조가 완전히 다름 → 시스템 테스트에 이상적
//
// 데이터 출처: 2025-2026 공식 발표 기준, 웹리서치 2026년 6월 확인.
// ⚠️ 매년 갱신 필요 — dataYear 필드로 추적.
// ============================================================================

// 개발·테스트용 fixture다. 운영 reference data로 사용하지 않는다.
// 수치는 실제 기능 구현 전에 필드별 공식 URL과 기준 연도를 다시 검증해야 한다.

export const SAMPLE_COLLEGES: College[] = [
  // ── 1. Stanford — 초엘리트 사립, 순수 need-based ──
  {
    id: 'stanford',
    name: 'Stanford University',
    aliases: ['Stanford', 'Leland Stanford'],
    country: 'US',
    state: 'CA',
    city: 'Stanford',
    type: 'private_nonprofit',

    costOfAttendance: {
      current: 96513,
      byYear: { '2025': 96513 },
    },

    needPolicy: {
      meetsFullNeed: true, // 100% demonstrated need
      avgNeedMetPct: 100,
      isGapping: false,
      requiresCSSProfile: true,
      aidForNonCitizens: 'same', // need-blind for domestic (영주권자 포함)
      // <$100K: tuition + room & board 무료
      // <$150K: tuition 무료
      // 대출 불포함 — 전액 scholarship
    },
    meritPolicy: {
      offers: false, // merit 장학금 없음
      aggressiveness: 'none',
    },

    admitRate: 0.039, // 3.9% (2024 cycle)
    enrolledDemographics: {
      enrolledDemographics: {},
      pctFirstGen: 19,
      pctPell: 19,
      dataYear: 2024,
      dataConfidence: 'official_cds',
    },
    usesTopXPercent: false,
    endedLegacy: false, // Stanford은 레거시 유지

    dataYear: 2025,
    dataSource: 'web_research',
    lastUpdated: '2026-06-22',
  },

  // ── 2. Northeastern — 공격적 merit + 100% need met ──
  {
    id: 'northeastern',
    name: 'Northeastern University',
    aliases: ['NEU', 'Northeastern'],
    country: 'US',
    state: 'MA',
    city: 'Boston',
    type: 'private_nonprofit',

    costOfAttendance: {
      current: 84731,
      byYear: { '2025': 84731 },
    },

    needPolicy: {
      meetsFullNeed: true, // 100% need met (admitted 기준)
      avgNeedMetPct: 100,
      isGapping: false,
      requiresCSSProfile: true,
      aidForNonCitizens: 'limited', // 국제학생에게 need-based 없음, merit만
    },
    meritPolicy: {
      offers: true,
      aggressiveness: 'very_generous', // ← 노스이스턴 케이스
      avgAward: 28000, // merit awards 최대 $90K/year
      thresholds: '별도 신청 불필요, 입학 시 자동 심사. Stamps Scholar = 전액',
      // Dean's Scholarship, Excellence Award, National Merit 등 다층 구조
    },

    admitRate: 0.065, // ~6.5%
    enrolledDemographics: {
      enrolledDemographics: {},
      pctFirstGen: 15,
      pctPell: 17,
      dataYear: 2024,
      dataConfidence: 'estimated',
    },
    usesTopXPercent: false,
    endedLegacy: false,

    dataYear: 2025,
    dataSource: 'web_research',
    lastUpdated: '2026-06-22',
  },

  // ── 3. Georgia Tech — 최상위 공립 STEM, OOS 격차 큼 ──
  {
    id: 'georgia_tech',
    name: 'Georgia Institute of Technology',
    aliases: ['Georgia Tech', 'GT', 'GaTech'],
    country: 'US',
    state: 'GA',
    city: 'Atlanta',
    type: 'public',

    costOfAttendance: {
      // NZ 영주권자 = out-of-state
      current: 54744, // out-of-state COA
      byYear: {
        '2025': 54744, // OOS
        // in-state 참고: $32,318
      },
    },

    needPolicy: {
      meetsFullNeed: false, // 67% of need met (평균)
      avgNeedMetPct: 67,
      isGapping: true, // gap 발생 가능
      requiresCSSProfile: true, // institutional need-based aid용
      aidForNonCitizens: 'limited',
      // Tech Promise: 가계소득 $60K 이하 Georgia 거주자 대상 → 페르소나 해당 안 됨
      // HOPE/Zell Miller: Georgia 거주자만 → 해당 안 됨
    },
    meritPolicy: {
      offers: true,
      aggressiveness: 'modest', // OOS에 대한 institutional merit 제한적
      avgAward: 5329,
      thresholds: "Stamps President's, Provost Scholar 등 경쟁 선발. 자동 merit 없음.",
      // Georgia 거주자: HOPE/Zell Miller로 사실상 in-state 무료 가까움
      // OOS: 이 혜택 없음 → 비용 부담 사립과 비슷
    },

    admitRate: 0.15, // 전체 ~15%, OOS ~9%
    enrolledDemographics: {
      enrolledDemographics: {},
      pctFirstGen: 12,
      pctPell: 14,
      dataYear: 2024,
      dataConfidence: 'official_cds',
    },
    usesTopXPercent: false,
    endedLegacy: false,

    dataYear: 2025,
    dataSource: 'web_research',
    lastUpdated: '2026-06-22',
  },
];

// ============================================================================
// 3개 대학의 재정 프로필 비교 (시스템이 이걸 보여줘야 함)
// ============================================================================
//
// | 항목              | Stanford      | Northeastern   | Georgia Tech (OOS) |
// |-------------------|---------------|----------------|---------------------|
// | COA               | $96,513       | $84,731        | $54,744             |
// | Need met          | 100%          | 100%           | 67%                 |
// | Merit 가능        | ✗             | ✓ 매우 공격적   | ✓ 제한적            |
// | CSS 필요          | ✓             | ✓              | ✓ (institutional)   |
// | 대출 포함 여부    | ✗ (무대출)    | 가능           | 가능                |
// | NZ 영주권자 적용  | domestic      | domestic       | domestic (OOS)      |
// | Gapping           | ✗             | ✗              | ✓                   |
//
// 노스이스턴 케이스 재현:
//   성적이 Stanford reach, GT target일 때 →
//   Northeastern의 merit $28K~$90K이 net price를 가장 낮출 수 있음.
//   이 비교가 시스템의 핵심 가치 (돈이 모자라 원서를 적게 쓴 실수 방지).
// ============================================================================
