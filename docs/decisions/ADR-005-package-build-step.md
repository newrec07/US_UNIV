# ADR-005 — 패키지 런타임 소비는 tsc 빌드 산출물(dist)을 통한다

- 상태: Accepted
- 결정일: 2026-06-23

## 맥락

`packages/domain`, `packages/contracts`는 지금까지 `package.json`의 `exports`가 TypeScript
원본(`./src/index.ts`)을 직접 가리켰다. 지금까지는 다른 패키지가 이들을 `import type`으로만
참조했고 vitest(esbuild)가 타입 전용 import를 번들링 전에 지워버려서 문제가 없었다.

`apps/api`가 NestJS로 만들어지면서 처음으로 실제 런타임 import(`@admissions/database`의
`getPrismaClient`)가 생긴다. NestJS는 생성자 타입 기반 의존성 주입을 위해
`emitDecoratorMetadata`에 의존하는데, 이는 `esbuild`/`tsx` 계열 트랜스파일러가 지원하지
않는다. 그렇다고 모든 패키지를 ESM 전용 ts-node 로더로 직접 실행하게 하면 Windows에서
설정이 까다롭고 결정적이지 않다.

## 결정

- `packages/domain`, `packages/contracts`, `packages/database`는 각각 `build`
  스크립트(`tsc -p tsconfig.json`)를 갖고, `exports`는 `src` 대신 `dist`(컴파일된 `.js`/`.d.ts`)를
  가리킨다.
- `apps/api`(이후 `apps/agent-worker`도 동일)는 일반 `tsc` + 컴파일된 `dist/main.js`를
  plain `node`로 실행한다. `ts-node`/`tsx` 같은 트랜스파일 전용 런타임을 NestJS 코드에
  쓰지 않는다 — `tsc`는 데코레이터 메타데이터를 완전히 지원하기 때문이다.
- 루트 `pnpm typecheck`/`pnpm test`는 먼저 `pnpm build`(워크스페이스 전체, pnpm의 토폴로지
  순서)를 실행한 뒤 각 패키지의 `typecheck`/`test`를 수행한다. 그래야 `@admissions/domain` 같은
  의존성의 타입 선언(`dist/index.d.ts`)이 typecheck 시점에 이미 존재한다.

## 결과

- 패키지(`domain`/`contracts`/`database`)의 `src`를 수정하면 그 패키지를 다시 빌드해야
  의존하는 패키지/앱에 반영된다. 루트 `pnpm build`가 의존성 순서대로 다시 빌드해 준다.
- `apps/web`, `apps/agent-worker`를 추가할 때도 같은 패턴(빌드 산출물 소비, plain node 실행)을
  따른다.
- `packages/database`는 Prisma 7로 만들어졌고, Prisma 7부터 `datasource.url`이 schema에서
  제거되어 `prisma.config.ts` + `@prisma/adapter-pg` 드라이버 어댑터로 연결 문자열을 다룬다.
  `prisma generate`는 실제 DB 연결 없이도 `DATABASE_URL` 형식 검증을 하므로, `.env`가 없으면
  `pnpm install`의 `postinstall`이 실패한다.
