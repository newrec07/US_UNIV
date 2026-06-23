---
name: verify-change
description: Run the deterministic Admissions OS verification harness and return the evidence report.
disable-model-invocation: true
allowed-tools: Bash Read
---

Run the full verification harness:

`powershell -NoProfile -ExecutionPolicy Bypass -File scripts/harness/Invoke-HarnessVerification.ps1 -Mode full -TaskId manual-verification`

Read the resulting `.harness/runs/*/report.json` and report the overall result, failures, and report path.
Do not change source code while this skill is active.
