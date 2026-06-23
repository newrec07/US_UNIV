---
name: review-security
description: Review or improve security for Admissions OS, including Next.js and NestJS code, authentication and authorization, API commands, Agent tool use, prompt injection, queues, Prisma and PostgreSQL access, file uploads, secrets, logs, student data, and family financial information. Use for security audits, threat modeling, pre-release reviews, sensitive-data changes, new endpoints or tools, dependency changes, and incident or vulnerability investigations.
---

# Review security

Review realistic attack paths and trust boundaries. Do not produce a generic compliance checklist.

## Establish scope and assets

1. Read the root and nearest directory `CLAUDE.md`.
2. Identify changed entry points, data stores, tools, queues, external calls, and privileged operations.
3. Identify protected assets:
   - minor student identity and academic records,
   - family financial information,
   - Messenger conversations and decisions,
   - Claude API and service credentials,
   - Agent prompts, tools, and audit records.
4. Identify actors and boundaries: browser, family user, API, Agent Worker, Claude, Redis, PostgreSQL, object storage, and external data sources.

For review-only requests, do not modify files. For explicit remediation requests, fix confirmed issues and add regression tests.

## Review order

### 1. Authentication and authorization

- Require server-side authentication for every private route, SSE stream, command, and file operation.
- Enforce authorization at the API boundary; never trust hidden UI controls.
- Check object-level authorization for student, conversation, action, college relation, and document IDs.
- Prevent confused-deputy behavior where Agent authority exceeds the requesting user.
- Review session expiry, token storage, logout, CSRF protection, and replay resistance.

### 2. Input and injection

- Validate path, query, body, event, queue, file, and LLM-structured inputs.
- Check SQL/ORM query construction, command injection, path traversal, template injection, XSS, SSRF, and unsafe URL fetching.
- Encode untrusted content at its output context.
- Apply size, type, count, and rate limits before expensive parsing or model calls.
- Treat uploaded documents, web pages, emails, and model output as untrusted data, never instructions.

### 3. Agent and prompt security

- Keep Agent database access prohibited; use narrow API tools.
- Give each tool the minimum readable fields and writable operations.
- Separate read tools from mutation proposals.
- Require `ProposedCommand`, validation, user confirmation, and transaction execution for consequential changes.
- Bind approval to the exact command payload and reject modified or expired approvals.
- Prevent prompt injection from overriding system policy, tool schemas, authorization, or data boundaries.
- Validate tool arguments and tool results independently of Claude.
- Limit tool-call count, recursion, retries, token use, and execution time.
- Record model, prompt version, data version, tool calls, approval, and outcome without logging sensitive content unnecessarily.
- Never let model text become SQL, shell, file paths, URLs, or code without deterministic validation.

### 4. Sensitive data and privacy

- Minimize collection and model disclosure of student and financial data.
- Keep secrets out of browser bundles, prompts, source control, logs, reports, and error messages.
- Redact tokens, tax identifiers, birth dates, addresses, and financial figures from telemetry where not required.
- Separate original sensitive files from normal relational fields.
- Require private storage, encryption, short-lived access, malware scanning, audit logs, retention, and deletion policy before source-document uploads.
- Ensure test fixtures and episode reports contain no real family data.
- Check data export and deletion for all replicas, queues, caches, logs, and object storage.

### 5. API, events, and queues

- Use schema validation and authenticated ownership for REST and SSE.
- Prevent users from subscribing to another student's events.
- Ensure SSE reconnect and event replay do not leak old or cross-user data.
- Make commands and jobs idempotent; deduplicate retries.
- Sign or authenticate internal callbacks and queue producers where boundaries require it.
- Avoid placing full sensitive records in Redis jobs; pass identifiers and fetch authorized projections.
- Define retry limits and dead-letter handling without exposing payloads.

### 6. Database and persistence

- Parameterize queries and constrain selected fields.
- Use transactions for related state, audit, version, and event writes.
- Prevent mass assignment and unsafe generic update objects.
- Check uniqueness, foreign keys, tenant/family scope, and optimistic concurrency.
- Keep migrations reversible where practical and avoid destructive implicit casts.
- Verify backups and administrative access receive equivalent protection.

### 7. Browser and web security

- Review CSP, security headers, secure cookies, CSRF, CORS, clickjacking, and referrer policy.
- Avoid rendering unsanitized Markdown, HTML, model output, or document text.
- Prevent secrets and private server data from entering client components or source maps.
- Check redirect targets and external links.
- Ensure error pages do not expose stack traces, IDs, or internal service details.

### 8. Dependencies and operations

- Prefer maintained packages and lock exact resolved versions through the package manager.
- Review install scripts and high-risk transitive dependencies.
- Keep production credentials separated by environment and least privilege.
- Define rate limits, cost limits, timeout, circuit breaking, and abuse handling for Claude and external APIs.
- Ensure monitoring records security-relevant events without collecting prompt or sensitive payload content by default.

## Severity

- `critical`: direct compromise of secrets, arbitrary code execution, cross-family data access, or destructive unauthenticated mutation
- `high`: practical privilege escalation, sensitive-data exposure, consequential Agent action without valid approval, or exploitable injection
- `medium`: meaningful defense gap requiring additional conditions or limited impact
- `low`: hardening issue with credible but small security value

Do not inflate severity without an executable path and affected asset.

## Finding standard

For each finding provide:

1. severity and weakness category
2. exact file and line
3. trust boundary and attacker prerequisites
4. exploit or failure sequence
5. affected data or capability
6. minimal remediation
7. regression test or deterministic verification

Do not include live secrets, weaponized payloads beyond what is necessary to demonstrate the issue, or real student data.

## Final report

Use this order:

1. Threat model summary
2. Findings by severity
3. Positive controls already present
4. Verification performed
5. Residual risks and deferred decisions

If no material issue exists, state `PASS` and name the attack surfaces actually reviewed.
