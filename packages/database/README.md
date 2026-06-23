# Database package

Prisma schema와 database client를 둔다.

- `prisma/schema.prisma` — 현재 `User` 모델만 둔다(`packages/domain`의 `User` 타입을 그대로 따름).
- `src/client.ts` — `PrismaClient` 싱글톤 접근자 `getPrismaClient()`.
- 실행 전 `.env.example`을 `.env`로 복사하고 `DATABASE_URL`을 채운다. Prisma 7은 `generate` 시점에도
  (실제 연결 없이) `DATABASE_URL` 형식 검증을 하므로, 이 값이 없으면 `pnpm install`의
  `postinstall`(`prisma generate`)이 즉시 실패한다.
- 연결은 `@prisma/adapter-pg` 드라이버 어댑터를 통해 만든다(Prisma 7부터 schema의
  `datasource.url`이 제거되고 `prisma.config.ts` + adapter 방식으로 바뀌었다).
- 스키마 변경 후 `pnpm --filter @admissions/database db:generate`로 client를 재생성한다.
- 이 패키지는 다른 패키지가 import할 때 컴파일된 `dist`를 사용하므로, 수정 후
  `pnpm --filter @admissions/database build`(또는 루트 `pnpm build`)로 다시 빌드해야 한다.
