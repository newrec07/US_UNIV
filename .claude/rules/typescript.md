---
paths:
  - '**/*.{ts,tsx}'
---

# TypeScript rules

- strict 타입을 유지하고 `any`로 오류를 우회하지 않는다.
- 외부 입력은 계약 계층에서 런타임 검증한다.
- 저장값과 계산값을 타입과 함수 이름에서 구분한다.
- 공개 import는 각 패키지의 `src/index.ts`를 통한다.
- 도메인 패키지에서 프레임워크와 ORM을 import하지 않는다.
