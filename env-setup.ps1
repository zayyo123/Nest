# Environment bootstrap for NestJS project
# This script checks core runtime prerequisites and installs missing tooling (optional).

Write-Host "Starting environment bootstrap...`n" -ForegroundColor Cyan

$results = @()

function Get-CommandOrNull([string]$cmd){
  try { return Get-Command $cmd -ErrorAction Stop } catch { return $null }
}

## Node
$nodeVersion = $null
try { $nodeVersion = & node -v 2>&1; $hasNode = $true } catch { $nodeVersion = "Not found"; $hasNode = $false }
Write-Host "Node.js: $nodeVersion" -ForegroundColor Green

## npm
$npmVersion = $null
try { $npmVersion = & npm -v 2>&1; $hasNpm = $true } catch { $npmVersion = "Not found"; $hasNpm = $false }
Write-Host "npm: $npmVersion" -ForegroundColor Green

## Yarn (global)
$yarnVersion = $null
try {
  if (Get-Command yarn -ErrorAction SilentlyContinue) {
    $yarnVersion = & yarn -v 2>&1
  } else {
    if (Get-Command corepack -ErrorAction SilentlyContinue) {
      & corepack enable 2>$null
      & corepack prepare yarn@stable --activate 2>$null
      if (Get-Command yarn -ErrorAction SilentlyContinue) { $yarnVersion = & yarn -v 2>&1 } else { $yarnVersion = "Not installed" }
    } else {
      # Fall back to npm global install
      & npm i -g yarn 2>$null
      if (Get-Command yarn -ErrorAction SilentlyContinue) { $yarnVersion = & yarn -v 2>&1 } else { $yarnVersion = "Not installed" }
    }
  }
} catch { $yarnVersion = "Not installed" }
Write-Host "Yarn: $yarnVersion" -ForegroundColor Green

## Docker
$dockerVersion = $null
try { $dockerVersion = & docker --version 2>&1; $hasDocker = $true } catch { $dockerVersion = "Not found"; $hasDocker = $false }
Write-Host "Docker: $dockerVersion" -ForegroundColor Green

Write-Host "`nEnvironment bootstrap completed. Review above for any missing tools." -ForegroundColor Cyan
Write-Host "Notes:" -ForegroundColor Yellow
Write-Host "- If Docker is not installed, consider installing Docker Desktop for Windows to enable containerized deployment." -ForegroundColor Yellow
Write-Host "- Yarn has been installed globally if permissible by your system permissions." -ForegroundColor Yellow
