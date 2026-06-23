$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)

$rawInput = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($rawInput)) {
  exit 0
}

$hookInput = $rawInput | ConvertFrom-Json
$filePath = [string]$hookInput.tool_input.file_path
if ([string]::IsNullOrWhiteSpace($filePath)) {
  exit 0
}

$projectRoot = [IO.Path]::GetFullPath($env:CLAUDE_PROJECT_DIR)
$resolvedPath = if ([IO.Path]::IsPathRooted($filePath)) {
  [IO.Path]::GetFullPath($filePath)
}
else {
  [IO.Path]::GetFullPath((Join-Path $projectRoot $filePath))
}

if (-not $resolvedPath.StartsWith($projectRoot, [StringComparison]::OrdinalIgnoreCase)) {
  exit 0
}

$relativePath = $resolvedPath.Substring($projectRoot.Length).TrimStart('\', '/')
$stateDirectory = Join-Path $projectRoot '.harness\state'
$dirtyStatePath = Join-Path $stateDirectory 'dirty.json'
New-Item -ItemType Directory -Force -Path $stateDirectory | Out-Null

$trackedFiles = [System.Collections.Generic.List[string]]::new()
if (Test-Path -LiteralPath $dirtyStatePath) {
  try {
    $existing = [IO.File]::ReadAllText($dirtyStatePath, [Text.Encoding]::UTF8) | ConvertFrom-Json
    foreach ($existingFile in @($existing.files)) {
      if ($existingFile) {
        $trackedFiles.Add([string]$existingFile)
      }
    }
  }
  catch {
    # A damaged state file should not block source edits. It is replaced below.
  }
}

if (-not $trackedFiles.Contains($relativePath)) {
  $trackedFiles.Add($relativePath)
}

$formatStatus = 'not-applicable'
$formatMessage = ''
$supportedExtensions = @('.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yaml', '.yml', '.css')
$extension = [IO.Path]::GetExtension($resolvedPath).ToLowerInvariant()

if ($supportedExtensions -contains $extension -and (Test-Path -LiteralPath $resolvedPath)) {
  $pnpm = Get-Command pnpm -ErrorAction SilentlyContinue
  if ($pnpm) {
    try {
      Push-Location $projectRoot
      $formatOutput = (& $pnpm.Source exec prettier --write --ignore-unknown $resolvedPath 2>&1 | Out-String)
      if ($LASTEXITCODE -eq 0) {
        $formatStatus = 'formatted'
      }
      else {
        $formatStatus = 'failed'
        $formatMessage = ($formatOutput -split "`r?`n" | Where-Object { $_ } | Select-Object -Last 4) -join ' | '
      }
    }
    catch {
      $formatStatus = 'failed'
      $formatMessage = $_.Exception.Message
    }
    finally {
      Pop-Location
    }
  }
  else {
    $formatStatus = 'pending-runtime'
    $formatMessage = 'pnpm is not available on PATH.'
  }
}

$state = [ordered]@{
  updatedAt = [DateTimeOffset]::UtcNow.ToString('o')
  files = @($trackedFiles | Sort-Object -Unique)
  lastFormat = [ordered]@{
    file = $relativePath
    status = $formatStatus
    message = $formatMessage
  }
}

$temporaryPath = "$dirtyStatePath.tmp"
[IO.File]::WriteAllText(
  $temporaryPath,
  ($state | ConvertTo-Json -Depth 8),
  [Text.UTF8Encoding]::new($false)
)
Move-Item -LiteralPath $temporaryPath -Destination $dirtyStatePath -Force

if ($formatStatus -eq 'failed') {
  [ordered]@{
    hookSpecificOutput = [ordered]@{
      hookEventName = 'PostToolUse'
      additionalContext = "Formatter failed for ${relativePath}: $formatMessage"
    }
  } | ConvertTo-Json -Depth 6 -Compress
}
