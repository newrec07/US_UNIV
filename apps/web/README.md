# Web

Next.js App Router 기반 골격.

- `app/page.tsx` — 첫 화면. 지금은 API 연동 전이라 빈 상태를 "시작 행동"으로 보여주는
  자리표시자만 있다(실제 `Action[]` 연동은 이후 슬라이스).
- `tsconfig.json`은 루트 `tsconfig.base.json`을 따르지 않는다 — Next.js가 자체 번들러로
  컴파일하며 `noEmit`이 필수이고 `moduleResolution: "bundler"`/`jsx: "preserve"`를 요구해서
  NodeNext 기반 설정과 근본적으로 다르다. `strict`, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`는 그대로 맞췄다.
- ADR-005(빌드 산출물을 통한 패키지 소비)는 여기 적용되지 않는다 — `apps/web`을 다른
  패키지가 import하지 않고, Next.js의 `next build`가 자체 빌드 파이프라인을 갖는다.
- 빌드/실행: `pnpm --filter @admissions/web dev` / `build` / `start`.
