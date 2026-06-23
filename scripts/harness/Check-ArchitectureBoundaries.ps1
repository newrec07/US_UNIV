[CmdletBinding()]
param(
  [switch]$Json
)

$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$violations = [System.Collections.Generic.List[object]]::new()

function Add-Violation {
  param(
    [string]$Rule,
    [string]$File,
    [int]$Line,
    [string]$Message
  )

  $violations.Add([ordered]@{
      rule = $Rule
      file = $File
      line = $Line
      message = $Message
    })
}

function Get-RelativePath {
  param([string]$Path)

  $rootUri = [Uri]::new(($projectRoot.TrimEnd('\') + '\'))
  $pathUri = [Uri]::new([IO.Path]::GetFullPath($Path))
  return [Uri]::UnescapeDataString($rootUri.MakeRelativeUri($pathUri).ToString()).Replace('/', '\')
}

function Test-SourceTree {
  param(
    [string]$Directory,
    [scriptblock]$Rule
  )

  if (-not (Test-Path -LiteralPath $Directory)) {
    return
  }

  Get-ChildItem -LiteralPath $Directory -Recurse -File -Include *.ts, *.tsx |
    Where-Object { $_.Name -notmatch '\.(test|spec)\.(ts|tsx)$' } |
    ForEach-Object {
      $file = $_
      $lines = [IO.File]::ReadAllLines($file.FullName, [Text.Encoding]::UTF8)
      for ($index = 0; $index -lt $lines.Count; $index++) {
        & $Rule $file $lines[$index] ($index + 1)
      }
    }
}

$domainRoot = Join-Path $projectRoot 'packages\domain\src'
Test-SourceTree $domainRoot {
  param($file, $line, $lineNumber)

  if ($line -match 'from\s+[''"]([^''"]+)[''"]') {
    $importTarget = $Matches[1]
    if (-not $importTarget.StartsWith('.')) {
      Add-Violation `
        -Rule 'domain-no-external-runtime-dependency' `
        -File (Get-RelativePath $file.FullName) `
        -Line $lineNumber `
        -Message "Domain production code imports external package '$importTarget'."
    }
  }

  if ($line -match '(:\s*any\b|<any>|as\s+any\b|any\[\]|Record<[^>]*,\s*any>)') {
    Add-Violation `
      -Rule 'no-explicit-any' `
      -File (Get-RelativePath $file.FullName) `
      -Line $lineNumber `
      -Message 'Explicit any is not allowed in domain production code.'
  }

  if ($line -match '\badmitChance\b') {
    Add-Violation `
      -Rule 'no-admission-prediction' `
      -File (Get-RelativePath $file.FullName) `
      -Line $lineNumber `
      -Message 'Admission prediction fields are prohibited by ADR-004.'
  }
}

$webRoot = Join-Path $projectRoot 'apps\web'
Test-SourceTree $webRoot {
  param($file, $line, $lineNumber)

  if ($line -match 'from\s+[''"]([^''"]*(database|prisma)[^''"]*)[''"]') {
    Add-Violation `
      -Rule 'web-no-database-access' `
      -File (Get-RelativePath $file.FullName) `
      -Line $lineNumber `
      -Message "Web code must use API contracts instead of '$($Matches[1])'."
  }
}

$workerRoot = Join-Path $projectRoot 'apps\agent-worker'
Test-SourceTree $workerRoot {
  param($file, $line, $lineNumber)

  if ($line -match 'from\s+[''"]([^''"]*(database|prisma)[^''"]*)[''"]') {
    Add-Violation `
      -Rule 'agent-worker-no-database-access' `
      -File (Get-RelativePath $file.FullName) `
      -Line $lineNumber `
      -Message "Agent Worker must use API tools instead of '$($Matches[1])'."
  }
}

$result = [ordered]@{
  passed = $violations.Count -eq 0
  checkedAt = [DateTimeOffset]::UtcNow.ToString('o')
  violations = $violations
}

if ($Json) {
  [Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
  $result | ConvertTo-Json -Depth 8
}
elseif ($violations.Count -eq 0) {
  Write-Host 'Architecture boundary check passed.'
}
else {
  foreach ($violation in $violations) {
    Write-Error "$($violation.file):$($violation.line) [$($violation.rule)] $($violation.message)"
  }
}

if ($violations.Count -gt 0) {
  exit 1
}
