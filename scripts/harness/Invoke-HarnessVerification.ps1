[CmdletBinding()]
param(
  [ValidateSet('quick', 'full')]
  [string]$Mode = 'full',

  [string]$TaskId = 'manual',

  [string[]]$ChangedFiles = @()
)

$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$startedAt = [DateTimeOffset]::UtcNow
$safeTaskId = ($TaskId -replace '[^A-Za-z0-9._-]', '-').Trim('-')
if ([string]::IsNullOrWhiteSpace($safeTaskId)) {
  $safeTaskId = 'task'
}

$episodeId = '{0}-{1}' -f $startedAt.ToString('yyyyMMddTHHmmssfffZ'), $safeTaskId
$runDirectory = Join-Path $projectRoot ".harness\runs\$episodeId"
$stateDirectory = Join-Path $projectRoot '.harness\state'
New-Item -ItemType Directory -Force -Path $runDirectory, $stateDirectory | Out-Null

$checks = [System.Collections.Generic.List[object]]::new()
$failures = [System.Collections.Generic.List[object]]::new()

function Add-CheckResult {
  param(
    [string]$Name,
    [bool]$Passed,
    [int]$ExitCode,
    [long]$DurationMs,
    [string]$OutputFile,
    [string]$Summary,
    [string]$FailureCategory = ''
  )

  $checks.Add([ordered]@{
      name = $Name
      passed = $Passed
      exitCode = $ExitCode
      durationMs = $DurationMs
      outputFile = $OutputFile
      summary = $Summary
    })

  if (-not $Passed) {
    $failures.Add([ordered]@{
        category = if ($FailureCategory) { $FailureCategory } else { 'verification_failure' }
        check = $Name
        message = $Summary
      })
  }
}

function Invoke-ExternalCheck {
  param(
    [string]$Name,
    [string]$Executable,
    [string[]]$Arguments,
    [string]$FailureCategory
  )

  $outputPath = Join-Path $runDirectory "$Name.log"
  $stopwatch = [Diagnostics.Stopwatch]::StartNew()
  $output = ''
  $exitCode = 1
  $ErrorActionPreference = 'Continue'

  try {
    Push-Location $projectRoot
    $output = (& $Executable @Arguments 2>&1 | Out-String)
    $exitCode = $LASTEXITCODE
    if ($null -eq $exitCode) {
      $exitCode = 0
    }
  }
  catch {
    $output = $_ | Out-String
    $exitCode = 1
  }
  finally {
    Pop-Location
    $stopwatch.Stop()
  }

  [IO.File]::WriteAllText($outputPath, $output, [Text.UTF8Encoding]::new($false))
  $relativeOutput = $outputPath.Substring($projectRoot.Length + 1)
  $summary = if ($exitCode -eq 0) {
    "$Name passed."
  }
  else {
    $tail = ($output -split "`r?`n" | Where-Object { $_ } | Select-Object -Last 8) -join ' | '
    if ([string]::IsNullOrWhiteSpace($tail)) {
      "$Name failed with exit code $exitCode."
    }
    else {
      $tail
    }
  }

  Add-CheckResult `
    -Name $Name `
    -Passed ($exitCode -eq 0) `
    -ExitCode $exitCode `
    -DurationMs $stopwatch.ElapsedMilliseconds `
    -OutputFile $relativeOutput `
    -Summary $summary `
    -FailureCategory $FailureCategory
}

function Test-JsonConfiguration {
  $outputPath = Join-Path $runDirectory 'json-configuration.log'
  $stopwatch = [Diagnostics.Stopwatch]::StartNew()
  $errors = [System.Collections.Generic.List[string]]::new()

  Get-ChildItem -LiteralPath $projectRoot -Recurse -File -Filter *.json |
    Where-Object {
      $_.FullName -notmatch '\\(node_modules|dist|build|coverage|\.next|\.git|\.harness|\.tools)\\'
    } |
    ForEach-Object {
      try {
        [void]([IO.File]::ReadAllText($_.FullName, [Text.Encoding]::UTF8) | ConvertFrom-Json)
      }
      catch {
        $errors.Add("$($_.FullName.Substring($projectRoot.Length + 1)): $($_.Exception.Message)")
      }
    }

  $stopwatch.Stop()
  [IO.File]::WriteAllLines($outputPath, $errors, [Text.UTF8Encoding]::new($false))
  Add-CheckResult `
    -Name 'json-configuration' `
    -Passed ($errors.Count -eq 0) `
    -ExitCode $(if ($errors.Count -eq 0) { 0 } else { 1 }) `
    -DurationMs $stopwatch.ElapsedMilliseconds `
    -OutputFile $outputPath.Substring($projectRoot.Length + 1) `
    -Summary $(if ($errors.Count -eq 0) { 'JSON configuration is valid.' } else { $errors -join ' | ' }) `
    -FailureCategory 'configuration'
}

function Get-CommandVersion {
  param(
    [string]$Command,
    [string[]]$Arguments
  )

  $resolved = Get-Command $Command -ErrorAction SilentlyContinue
  if (-not $resolved) {
    return $null
  }

  try {
    return ((& $resolved.Source @Arguments 2>$null | Select-Object -First 1) -as [string]).Trim()
  }
  catch {
    return $null
  }
}

if ($ChangedFiles.Count -eq 0) {
  $dirtyStatePath = Join-Path $stateDirectory 'dirty.json'
  if (Test-Path -LiteralPath $dirtyStatePath) {
    try {
      $dirtyState = [IO.File]::ReadAllText($dirtyStatePath, [Text.Encoding]::UTF8) | ConvertFrom-Json
      $ChangedFiles = @($dirtyState.files)
    }
    catch {
      $failures.Add([ordered]@{
          category = 'state'
          check = 'dirty-state'
          message = $_.Exception.Message
        })
    }
  }
}

Test-JsonConfiguration

Invoke-ExternalCheck `
  -Name 'architecture-boundaries' `
  -Executable 'powershell.exe' `
  -Arguments @(
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    (Join-Path $PSScriptRoot 'Check-ArchitectureBoundaries.ps1')
  ) `
  -FailureCategory 'architecture'

$nodeVersion = Get-CommandVersion -Command 'node' -Arguments @('--version')
$pnpmVersion = Get-CommandVersion -Command 'pnpm' -Arguments @('--version')

if (-not $nodeVersion -or -not $pnpmVersion) {
  Add-CheckResult `
    -Name 'runtime-prerequisites' `
    -Passed $false `
    -ExitCode 1 `
    -DurationMs 0 `
    -OutputFile '' `
    -Summary 'Node.js and pnpm must be available on PATH.' `
    -FailureCategory 'environment'
}
else {
  Add-CheckResult `
    -Name 'runtime-prerequisites' `
    -Passed $true `
    -ExitCode 0 `
    -DurationMs 0 `
    -OutputFile '' `
    -Summary "Node $nodeVersion; pnpm $pnpmVersion."

  $pnpmCommand = (Get-Command pnpm).Source

  Invoke-ExternalCheck `
    -Name 'typecheck' `
    -Executable $pnpmCommand `
    -Arguments @('typecheck') `
    -FailureCategory 'typecheck'

  if ($Mode -eq 'full') {
    Invoke-ExternalCheck `
      -Name 'format-check' `
      -Executable $pnpmCommand `
      -Arguments @('format:check') `
      -FailureCategory 'format'

    Invoke-ExternalCheck `
      -Name 'tests' `
      -Executable $pnpmCommand `
      -Arguments @('test') `
      -FailureCategory 'test'
  }
}

$finishedAt = [DateTimeOffset]::UtcNow
$passed = ($checks | Where-Object { -not $_.passed }).Count -eq 0 -and $failures.Count -eq 0
$reportPath = Join-Path $runDirectory 'report.json'

$report = [ordered]@{
  schemaVersion = '1.0'
  episodeId = $episodeId
  taskId = $TaskId
  mode = $Mode
  startedAt = $startedAt.ToString('o')
  finishedAt = $finishedAt.ToString('o')
  durationMs = [long]($finishedAt - $startedAt).TotalMilliseconds
  status = if ($passed) { 'passed' } else { 'failed' }
  environment = [ordered]@{
    os = [Environment]::OSVersion.VersionString
    node = $nodeVersion
    pnpm = $pnpmVersion
  }
  changedFiles = @($ChangedFiles | Where-Object { $_ } | Sort-Object -Unique)
  checks = $checks
  failureAttribution = $failures
  humanInterventions = @()
}

[IO.File]::WriteAllText(
  $reportPath,
  ($report | ConvertTo-Json -Depth 12),
  [Text.UTF8Encoding]::new($false)
)
[IO.File]::WriteAllText(
  (Join-Path $stateDirectory 'latest-report.json'),
  ($report | ConvertTo-Json -Depth 12),
  [Text.UTF8Encoding]::new($false)
)

if ($passed) {
  $dirtyStatePath = Join-Path $stateDirectory 'dirty.json'
  if (Test-Path -LiteralPath $dirtyStatePath) {
    Remove-Item -LiteralPath $dirtyStatePath -Force
  }
}

$relativeReportPath = $reportPath.Substring($projectRoot.Length + 1)
Write-Host "Harness status: $($report.status)"
Write-Host "Episode report: $relativeReportPath"

if (-not $passed) {
  exit 1
}
