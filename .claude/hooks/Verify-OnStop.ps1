$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)

$rawInput = [Console]::In.ReadToEnd()
$hookInput = if ([string]::IsNullOrWhiteSpace($rawInput)) {
  $null
}
else {
  $rawInput | ConvertFrom-Json
}

if ($hookInput -and $hookInput.stop_hook_active -eq $true) {
  exit 0
}

$projectRoot = [IO.Path]::GetFullPath($env:CLAUDE_PROJECT_DIR)
$dirtyStatePath = Join-Path $projectRoot '.harness\state\dirty.json'
if (-not (Test-Path -LiteralPath $dirtyStatePath)) {
  exit 0
}

$node = Get-Command node -ErrorAction SilentlyContinue
$pnpm = Get-Command pnpm -ErrorAction SilentlyContinue
if (-not $node -or -not $pnpm) {
  $verificationScript = Join-Path $projectRoot 'scripts\harness\Invoke-HarnessVerification.ps1'
  & powershell.exe `
    -NoProfile `
    -ExecutionPolicy Bypass `
    -File $verificationScript `
    -Mode quick `
    -TaskId 'claude-stop-runtime-missing' *> $null

  # Avoid an endless Stop loop before the project runtime is installed.
  # Manual verification still fails and records the missing prerequisite.
  exit 0
}

$sessionId = if ($hookInput -and $hookInput.session_id) {
  [string]$hookInput.session_id
}
else {
  'unknown-session'
}

$verificationScript = Join-Path $projectRoot 'scripts\harness\Invoke-HarnessVerification.ps1'
$output = (& powershell.exe `
    -NoProfile `
    -ExecutionPolicy Bypass `
    -File $verificationScript `
    -Mode full `
    -TaskId "claude-stop-$sessionId" 2>&1 | Out-String)
$exitCode = $LASTEXITCODE

if ($exitCode -ne 0) {
  $latestReportPath = Join-Path $projectRoot '.harness\state\latest-report.json'
  $reportReference = if (Test-Path -LiteralPath $latestReportPath) {
    '.harness/state/latest-report.json'
  }
  else {
    'No report was generated.'
  }

  $tail = ($output -split "`r?`n" | Where-Object { $_ } | Select-Object -Last 8) -join ' | '
  [ordered]@{
    decision = 'block'
    reason = "Verification failed. Fix the reported issues before stopping. Report: $reportReference. $tail"
  } | ConvertTo-Json -Depth 6 -Compress
}
