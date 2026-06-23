# Verification Harness

이 폴더는 Claude Code가 “완료”라고 선언하기 전에 실행할 결정적 검증 계약을 설명한다.

## 실행

```powershell
pnpm verify
pnpm verify:quick
```

직접 실행:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass `
  -File scripts/harness/Invoke-HarnessVerification.ps1 `
  -Mode full `
  -TaskId my-task
```

## 검증 항목

- JSON 설정 파일 파싱
- monorepo 아키텍처 경계
- Node.js와 pnpm 실행 환경
- TypeScript strict typecheck
- Prettier 검사
- Vitest

## Episode report

각 실행은 `.harness/runs/<episode-id>/report.json`과 개별 command log를 만든다.
`.harness/state/latest-report.json`은 가장 최근 결과를 가리킨다.

보고서에는 작업 ID, 변경 파일, 환경, 실행 명령, 성공 여부, 실패 분류가 기록된다.
사용자 프롬프트나 학생·재정 데이터는 기록하지 않는다.

## Claude Code 연결

- `PostToolUse`: 변경 파일 기록 및 Prettier 실행
- `Stop`: 변경이 있으면 full verification 실행
- 실패 시 Stop을 차단하고 최신 report 경로를 Claude에 반환
- 성공 시 dirty state를 제거

Hook 자체가 소스 파일을 수정하지 않도록 유지한다. formatter만 편집 직후 해당 파일을 정규화한다.

Node.js 또는 pnpm이 아직 설치되지 않은 환경에서는 manual verification이 `environment` 실패를
기록한다. 이 상태에서는 무한 Stop loop를 피하기 위해 Stop hook이 종료를 차단하지 않는다.
두 명령이 PATH에서 발견되는 순간부터 Stop 실패가 작업 완료를 차단한다.
