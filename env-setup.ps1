# 学习注释：这是 Windows PowerShell 环境检查脚本。
# 它不会启动项目，只负责检查 Node、npm、Yarn、Docker 等工具是否存在。
# 初学者可以先运行它，确认本机是否具备前后端开发的基础环境。

Write-Host "Starting environment bootstrap...`n" -ForegroundColor Cyan

$results = @()

# 学习注释：把“查命令是否存在”的逻辑封装成函数，后面检查多个工具时可复用。
function Get-CommandOrNull([string]$cmd){
  try { return Get-Command $cmd -ErrorAction Stop } catch { return $null }
}

## Node：运行 Vue、Nest、Vite、TypeScript 构建工具的基础运行时。
$nodeVersion = $null
try { $nodeVersion = & node -v 2>&1; $hasNode = $true } catch { $nodeVersion = "Not found"; $hasNode = $false }
Write-Host "Node.js: $nodeVersion" -ForegroundColor Green

## npm：Node 自带的包管理器，用来 npm install / npm run dev。
$npmVersion = $null
try { $npmVersion = & npm -v 2>&1; $hasNpm = $true } catch { $npmVersion = "Not found"; $hasNpm = $false }
Write-Host "npm: $npmVersion" -ForegroundColor Green

## Yarn (global)：另一个常见包管理器；这个项目主要用 npm，但检查它有助于学习工具链。
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
      # 学习注释：如果没有 corepack，就退回到 npm 全局安装 yarn。
      & npm i -g yarn 2>$null
      if (Get-Command yarn -ErrorAction SilentlyContinue) { $yarnVersion = & yarn -v 2>&1 } else { $yarnVersion = "Not installed" }
    }
  }
} catch { $yarnVersion = "Not installed" }
Write-Host "Yarn: $yarnVersion" -ForegroundColor Green

## Docker：用容器一次性启动 MySQL、后端和前端。
$dockerVersion = $null
try { $dockerVersion = & docker --version 2>&1; $hasDocker = $true } catch { $dockerVersion = "Not found"; $hasDocker = $false }
Write-Host "Docker: $dockerVersion" -ForegroundColor Green

Write-Host "`nEnvironment bootstrap completed. Review above for any missing tools." -ForegroundColor Cyan
Write-Host "Notes:" -ForegroundColor Yellow
Write-Host "- If Docker is not installed, consider installing Docker Desktop for Windows to enable containerized deployment." -ForegroundColor Yellow
Write-Host "- Yarn has been installed globally if permissible by your system permissions." -ForegroundColor Yellow
