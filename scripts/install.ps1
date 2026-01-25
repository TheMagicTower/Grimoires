#Requires -Version 5.1
# ============================================================
# Grimoires Installer for Windows PowerShell
# ============================================================

$ErrorActionPreference = "Stop"
$Version = "0.2.0"
$InstallDir = if ($env:GRIMOIRES_HOME) { $env:GRIMOIRES_HOME } else { "$env:USERPROFILE\.grimoires" }
$RepoUrl = "https://github.com/bluelucifer/Grimoires"
$ReleaseUrl = "$RepoUrl/releases/latest/download"

function Write-Banner {
    Write-Host ""
    Write-Host "  +=============================================+" -ForegroundColor Magenta
    Write-Host "  |         GRIMOIRES INSTALLER                 |" -ForegroundColor Magenta
    Write-Host "  |     Multi-AI Agent Orchestration for        |" -ForegroundColor Magenta
    Write-Host "  |              Claude Code                    |" -ForegroundColor Magenta
    Write-Host "  +=============================================+" -ForegroundColor Magenta
    Write-Host ""
}

function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "[OK] $Message" -ForegroundColor Green }
function Write-Warn { param($Message) Write-Host "[WARN] $Message" -ForegroundColor Yellow }
function Write-Err { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

function Test-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Blue
    Write-Host ""

    # Node.js
    try {
        $nodeVersion = (node -v) -replace 'v', ''
        $major = [int]($nodeVersion.Split('.')[0])
        if ($major -lt 18) {
            throw "Node.js 18+ required (found: v$nodeVersion)"
        }
        Write-Success "Node.js v$nodeVersion"
    }
    catch {
        Write-Err "Node.js not found or version too old. Please install Node.js 18+"
        Write-Host "  Install from: https://nodejs.org/"
        exit 1
    }

    # npm
    try {
        $npmVersion = npm -v
        Write-Success "npm v$npmVersion"
    }
    catch {
        Write-Err "npm not found"
        exit 1
    }

    # Claude Code (optional in CI/non-interactive mode)
    try {
        $null = Get-Command claude -ErrorAction Stop
        Write-Success "Claude Code CLI"
    }
    catch {
        Write-Warn "Claude Code CLI not found"
        Write-Host "  Install: npm install -g @anthropic-ai/claude-code"

        # Check if running in CI or non-interactive mode
        $isCI = $env:CI -or $env:GITHUB_ACTIONS -or (-not [Environment]::UserInteractive)
        if ($isCI) {
            Write-Info "Non-interactive mode: skipping Claude Code installation"
            Write-Info "Install manually later: npm install -g @anthropic-ai/claude-code"
        }
        else {
            $install = Read-Host "Install Claude Code now? [Y/n]"
            if ($install -ne 'n') {
                npm install -g @anthropic-ai/claude-code
                Write-Success "Claude Code CLI installed"
            }
            else {
                Write-Warn "Claude Code not installed. Install later to use Grimoires."
            }
        }
    }
}

function Install-Grimoires {
    Write-Host ""
    Write-Host "Downloading Grimoires..." -ForegroundColor Blue

    # Remove existing installation
    if (Test-Path $InstallDir) {
        Write-Info "Removing existing installation..."
        Remove-Item -Path $InstallDir -Recurse -Force
    }

    # Create directory
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

    # Try downloading release
    $zipPath = "$env:TEMP\grimoires-core.zip"
    $downloaded = $false

    Write-Info "Attempting to download release package..."
    try {
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri "$ReleaseUrl/grimoires-core.zip" -OutFile $zipPath -UseBasicParsing -ErrorAction Stop
        Expand-Archive -Path $zipPath -DestinationPath $InstallDir -Force
        Remove-Item $zipPath -ErrorAction SilentlyContinue
        $downloaded = $true
        Write-Success "Downloaded release package"
    }
    catch {
        Write-Info "Release package not available (this is normal for development versions)"
    }

    # Fallback to git clone
    if (-not $downloaded) {
        Write-Info "Falling back to git clone from repository..."
        try {
            git clone --depth 1 "$RepoUrl.git" "$InstallDir\repo"

            # Copy core files
            if (Test-Path "$InstallDir\repo\core") {
                Copy-Item -Path "$InstallDir\repo\core" -Destination $InstallDir -Recurse -Force
            }
            if (Test-Path "$InstallDir\repo\templates") {
                Copy-Item -Path "$InstallDir\repo\templates" -Destination $InstallDir -Recurse -Force
            }
            if (Test-Path "$InstallDir\repo\mcp") {
                Copy-Item -Path "$InstallDir\repo\mcp" -Destination $InstallDir -Recurse -Force
            }

            # Fallback: copy old structure
            if (-not (Test-Path "$InstallDir\core")) {
                New-Item -ItemType Directory -Force -Path "$InstallDir\core" | Out-Null
                if (Test-Path "$InstallDir\repo\tower") {
                    Copy-Item -Path "$InstallDir\repo\tower" -Destination "$InstallDir\core\" -Recurse -Force
                }
                if (Test-Path "$InstallDir\repo\familiars") {
                    Copy-Item -Path "$InstallDir\repo\familiars" -Destination "$InstallDir\core\" -Recurse -Force
                }
                if (Test-Path "$InstallDir\repo\spells") {
                    Copy-Item -Path "$InstallDir\repo\spells" -Destination "$InstallDir\core\" -Recurse -Force
                }
                if (Test-Path "$InstallDir\repo\runes\rules") {
                    Copy-Item -Path "$InstallDir\repo\runes\rules" -Destination "$InstallDir\core\" -Recurse -Force
                }
                if (Test-Path "$InstallDir\repo\runes\mcp") {
                    Copy-Item -Path "$InstallDir\repo\runes\mcp" -Destination "$InstallDir\mcp" -Recurse -Force
                }
                if (Test-Path "$InstallDir\repo\registry\templates") {
                    Copy-Item -Path "$InstallDir\repo\registry\templates" -Destination "$InstallDir\templates" -Recurse -Force
                }
            }

            Remove-Item -Path "$InstallDir\repo" -Recurse -Force
        }
        catch {
            Write-Err "Failed to clone repository. Please install git."
            exit 1
        }
    }

    Set-Content -Path "$InstallDir\version" -Value $Version
    Write-Success "Downloaded to $InstallDir"
}

function Set-EnvironmentPath {
    Write-Host ""
    Write-Host "Setting up PATH..." -ForegroundColor Blue

    $binDir = "$InstallDir\bin"
    New-Item -ItemType Directory -Force -Path $binDir | Out-Null

    # Create CLI batch wrapper
    $cliContent = @"
@echo off
setlocal

if "%GRIMOIRES_HOME%"=="" set GRIMOIRES_HOME=%USERPROFILE%\.grimoires

if "%1"=="version" goto :version
if "%1"=="-v" goto :version
if "%1"=="--version" goto :version
if "%1"=="update" goto :update
if "%1"=="uninstall" goto :uninstall
if "%1"=="doctor" goto :doctor
if "%1"=="init" goto :init
goto :help

:version
if exist "%GRIMOIRES_HOME%\version" (
    set /p VER=<"%GRIMOIRES_HOME%\version"
    echo Grimoires v%VER%
) else (
    echo Grimoires (version unknown)
)
goto :eof

:update
echo Updating Grimoires...
powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/bluelucifer/Grimoires/main/scripts/install.ps1 | iex"
goto :eof

:uninstall
echo Running uninstaller...
powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/bluelucifer/Grimoires/main/scripts/uninstall.ps1 | iex"
goto :eof

:doctor
echo Checking Grimoires installation...
echo.
if exist "%GRIMOIRES_HOME%" (
    echo [OK] Installation directory: %GRIMOIRES_HOME%
) else (
    echo [ERROR] Installation directory not found
    exit /b 1
)
if exist "%GRIMOIRES_HOME%\version" (
    set /p VER=<"%GRIMOIRES_HOME%\version"
    echo [OK] Version: %VER%
) else (
    echo [WARN] Version file not found
)
if exist "%GRIMOIRES_HOME%\core" (echo [OK] core\ exists) else (echo [WARN] core\ not found)
if exist "%GRIMOIRES_HOME%\templates" (echo [OK] templates\ exists) else (echo [WARN] templates\ not found)
if exist "%GRIMOIRES_HOME%\mcp" (echo [OK] mcp\ exists) else (echo [WARN] mcp\ not found)
where claude >nul 2>nul && (echo [OK] Claude Code CLI available) || (echo [WARN] Claude Code CLI not found)
echo.
echo Installation health check complete.
goto :eof

:init
echo To initialize Grimoires in a project, use Claude Code:
echo   1. Open Claude Code in your project directory
echo   2. Run: /cast:summon
goto :eof

:help
echo Grimoires - Multi-AI Agent Orchestration for Claude Code
echo.
echo Usage:
echo     grimoires [command]
echo.
echo Commands:
echo     version     Show installed version
echo     update      Update to latest version
echo     uninstall   Remove Grimoires from system
echo     doctor      Check installation health
echo     help        Show this help message
echo.
echo Project Commands (run in project directory):
echo     init        Initialize Grimoires for current project
echo.
echo Note: Most Grimoires commands are used within Claude Code:
echo     /cast:summon    - Initialize project
echo     /cast:dev       - Start development workflow
echo     /cast:review    - Code review
echo.
echo For more information: https://github.com/bluelucifer/Grimoires
goto :eof
"@
    Set-Content -Path "$binDir\grimoires.cmd" -Value $cliContent

    # Add to user PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($currentPath -notlike "*$binDir*") {
        $newPath = "$binDir;$currentPath"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        [Environment]::SetEnvironmentVariable("GRIMOIRES_HOME", $InstallDir, "User")
        Write-Success "Added to PATH"
    }
    else {
        Write-Info "PATH already configured"
    }

    # Update current session
    $env:Path = "$binDir;$env:Path"
    $env:GRIMOIRES_HOME = $InstallDir
}

function New-GlobalConfig {
    Write-Host ""
    Write-Host "Creating global configuration..." -ForegroundColor Blue

    $configPath = "$InstallDir\config.yaml"
    if (-not (Test-Path $configPath)) {
        $config = @"
# Grimoires Global Configuration
# https://github.com/bluelucifer/Grimoires

version: "$Version"

# API Keys (set via environment variables or here)
# Note: Environment variables take precedence
api_keys:
  openai: `${OPENAI_API_KEY}
  google: `${GOOGLE_API_KEY}
  figma: `${FIGMA_ACCESS_TOKEN}

# Default settings for new projects
defaults:
  preset: auto
  auto_init: true
  parallel_limit: 4
  familiars:
    - codex
    - gemini
    - reviewer

# Cost management settings
cost:
  enabled: false
  daily_budget: 10.00
  alerts: true
  routing:
    simple_tasks: haiku
    standard_tasks: sonnet
    complex_tasks: opus

# Update settings
updates:
  auto_check: true
  channel: stable

# Telemetry (anonymous usage statistics)
telemetry:
  enabled: false
"@
        Set-Content -Path $configPath -Value $config
        Write-Success "Configuration created at $configPath"
    }
    else {
        Write-Info "Configuration already exists"
    }
}

function Copy-Scripts {
    Write-Host ""
    Write-Host "Copying utility scripts..." -ForegroundColor Blue

    $scriptsDir = "$InstallDir\scripts"
    New-Item -ItemType Directory -Force -Path $scriptsDir | Out-Null

    # Copy this install script for offline access
    $installUrl = "https://raw.githubusercontent.com/bluelucifer/Grimoires/main/scripts/install.ps1"
    try {
        Invoke-WebRequest -Uri $installUrl -OutFile "$scriptsDir\install.ps1" -UseBasicParsing
    }
    catch {
        # Ignore if can't download
    }

    Write-Success "Utility scripts installed"
}

function Write-Success-Banner {
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host "  Grimoires installed successfully!         " -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Installation:" -ForegroundColor Cyan
    Write-Host "    Location: $InstallDir"
    Write-Host "    Version:  $Version"
    Write-Host ""
    Write-Host "  Quick Start:" -ForegroundColor Cyan
    Write-Host "    1. Open a new terminal window"
    Write-Host "    2. Navigate to your project directory"
    Write-Host "    3. Run any /cast: command in Claude Code"
    Write-Host ""
    Write-Host "  Commands in Claude Code:" -ForegroundColor Cyan
    Write-Host "    /cast:summon    - Initialize Grimoires for project"
    Write-Host "    /cast:dev       - Start development workflow"
    Write-Host "    /cast:review    - Code review"
    Write-Host "    /cast:analyze   - Code analysis"
    Write-Host ""
    Write-Host "  CLI Commands:" -ForegroundColor Cyan
    Write-Host "    grimoires version   - Show version"
    Write-Host "    grimoires doctor    - Check installation"
    Write-Host "    grimoires update    - Update Grimoires"
    Write-Host "    grimoires uninstall - Remove Grimoires"
    Write-Host ""
    Write-Host "  Documentation:" -ForegroundColor Cyan
    Write-Host "    https://github.com/bluelucifer/Grimoires"
    Write-Host ""
}

# Main
Write-Banner
Test-Prerequisites
Install-Grimoires
Set-EnvironmentPath
New-GlobalConfig
Copy-Scripts
Write-Success-Banner
