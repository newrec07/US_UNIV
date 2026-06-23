# Domain package

프레임워크에 독립적인 TypeScript 도메인 타입과 결정적 규칙을 소유한다.

- Next.js, NestJS, Prisma, Redis, Claude SDK를 import하지 않는다.
- TypeScript 타입이 도메인 구조의 기준이다.
- 규칙 함수는 같은 입력에 같은 결과를 반환하는 순수 함수로 작성한다.
- 현재 날짜처럼 변하는 값은 함수 인자로 받는다.
- `any`와 타입 단언으로 구조 오류를 숨기지 않는다.
- 공개 타입과 함수는 `src/index.ts`에서 export한다.
