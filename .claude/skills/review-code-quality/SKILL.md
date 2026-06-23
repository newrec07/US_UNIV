---
name: review-code-quality
description: Review or improve Admissions OS code quality across TypeScript, Next.js, NestJS, domain rules, API contracts, tests, and PowerShell harness scripts. Use for code reviews, refactoring requests, pre-merge checks, maintainability audits, correctness investigations, test-quality reviews, or when implementation quality may have regressed.
---

# Review code quality

Assess correctness before style. Prefer a small number of evidence-backed findings over a long generic checklist.

## Establish scope

1. Read the root and nearest directory `CLAUDE.md`.
2. Inspect the changed files and their direct callers, consumers, contracts, and tests.
3. Read the relevant ADR or architecture document only when the change touches that decision.
4. Run the narrowest useful verification first. Use `pnpm verify` before completion when the runtime is available.

For review-only requests, do not edit files. For explicit fix requests, implement fixes after identifying the cause.

## Review order

### 1. Correctness

- Trace inputs, state transitions, outputs, and failure paths.
- Check boundary values, empty collections, missing optional values, invalid dates, stale data, and partial records.
- Check async operations for lost errors, duplicate execution, races, non-idempotent retries, and partial writes.
- Ensure derived values are recalculated rather than stored inconsistently.
- Reject silent fallback behavior that turns unknown data into plausible-looking facts.

### 2. Domain integrity

- Preserve the action-guide principle: measurements must lead to useful next actions.
- Keep changing historical values as history and compute current state or trends.
- Use stable IDs for relationships.
- Keep objective shared facts separate from student-specific relationships.
- Preserve provenance, effective date, confidence, and data-version references.
- Never introduce admission probability or pass/fail prediction.
- Use `$domain-change` when domain structure changes.

### 3. Type and contract quality

- Avoid `any`, unsafe assertions, duplicated DTOs, and stringly typed state when a bounded type exists.
- Keep `packages/domain` independent of frameworks and infrastructure.
- Validate all external, API, queue, file, and LLM-structured inputs at runtime.
- Check that public exports are intentional and package boundaries are respected.
- Check contract changes against every producer and consumer.
- Prefer discriminated unions for state machines and command outcomes.

### 4. Architecture

- Web must not access the database or Claude directly.
- Agent Worker must not access the database directly.
- API must remain the mutation boundary and use transactions for related writes.
- Do not duplicate domain rules in controllers, UI components, prompts, or persistence code.
- Keep pure calculation code separate from I/O.
- Flag circular dependencies and modules with mixed responsibilities.

### 5. Tests and verification

- Require tests for changed behavior, not implementation details.
- Cover success, failure, boundary, and time-dependent cases.
- Inject time and nondeterministic dependencies.
- Verify retry and idempotency behavior for commands, jobs, and events.
- Keep fixtures explicit about source year and confidence.
- Treat skipped, flaky, or assertion-free tests as findings.
- Run architecture boundary checks and relevant tests.

### 6. Maintainability

- Prefer clear names and direct control flow over clever abstraction.
- Remove duplication only when the shared concept is stable.
- Avoid speculative frameworks, generic repositories, or abstractions with one weak use case.
- Check comments against actual behavior; remove stale commentary.
- Ensure errors contain actionable context without leaking sensitive data.
- Note performance issues only when the path or data volume makes them credible.

## Finding standard

Report only findings that are:

- demonstrably incorrect,
- likely to cause a production failure,
- a concrete architectural or domain violation,
- a meaningful testing gap, or
- a material maintenance cost.

For each finding provide:

1. severity: `critical`, `high`, `medium`, or `low`
2. exact file and line
3. observed behavior
4. realistic impact
5. smallest appropriate fix

Do not report subjective formatting preferences already handled by Prettier.

## Final report

Use this order:

1. Findings by severity
2. Assumptions or unresolved questions
3. Verification commands and results
4. Residual risks

If no material issue exists, state `PASS` and list the verification actually performed.
