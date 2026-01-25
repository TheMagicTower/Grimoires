@echo off
setlocal EnableDelayedExpansion

:: ============================================================
:: Grimoires Installer for Windows CMD
:: ============================================================

set VERSION=0.2.0
if defined GRIMOIRES_HOME (
    set INSTALL_DIR=%GRIMOIRES_HOME%
) else (
    set INSTALL_DIR=%USERPROFILE%\.grimoires
)
set REPO_URL=https://github.com/bluelucifer/Grimoires
set RELEASE_URL=%REPO_URL%/releases/latest/download

echo.
echo   +=============================================+
echo   ^|         GRIMOIRES INSTALLER                 ^|
echo   ^|     Multi-AI Agent Orchestration for        ^|
echo   ^|              Claude Code                    ^|
echo   +=============================================+
echo.

:: Check Node.js
echo Checking prerequisites...
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+
    echo   Install from: https://nodejs.org/
    exit /b 1
)

for /f "tokens=1 delims=v" %%i in ('node -v') do set NODE_VER=%%i
for /f "tokens=1 delims=." %%i in ('node -v') do set NODE_MAJOR=%%i
set NODE_MAJOR=%NODE_MAJOR:v=%

if %NODE_MAJOR% LSS 18 (
    echo [ERROR] Node.js 18+ required
    exit /b 1
)
echo [OK] Node.js found

:: Check npm
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm not found
    exit /b 1
)
echo [OK] npm found

:: Check Claude Code
where claude >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [WARN] Claude Code CLI not found
    echo   Install: npm install -g @anthropic-ai/claude-code
    set /p INSTALL_CLAUDE="Install Claude Code now? [Y/n]: "
    if /i "!INSTALL_CLAUDE!" neq "n" (
        npm install -g @anthropic-ai/claude-code
        if %ERRORLEVEL% neq 0 (
            echo [ERROR] Failed to install Claude Code
            exit /b 1
        )
        echo [OK] Claude Code CLI installed
    ) else (
        echo Claude Code is required. Exiting.
        exit /b 1
    )
) else (
    echo [OK] Claude Code CLI found
)

:: Remove existing installation
echo.
echo Downloading Grimoires...

if exist "%INSTALL_DIR%" (
    echo Removing existing installation...
    rmdir /s /q "%INSTALL_DIR%"
)

:: Create directory
mkdir "%INSTALL_DIR%" 2>nul

:: Try downloading release zip
set DOWNLOADED=0
curl -fsSL "%RELEASE_URL%/grimoires-core.zip" -o "%TEMP%\grimoires.zip" 2>nul
if %ERRORLEVEL% equ 0 (
    powershell -Command "Expand-Archive -Path '%TEMP%\grimoires.zip' -DestinationPath '%INSTALL_DIR%' -Force"
    del "%TEMP%\grimoires.zip" 2>nul
    set DOWNLOADED=1
)

:: Fallback to git clone
if %DOWNLOADED% equ 0 (
    echo Release not found, cloning from repository...
    where git >nul 2>nul
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] git is required to install from source
        exit /b 1
    )

    git clone --depth 1 "%REPO_URL%.git" "%INSTALL_DIR%\repo"
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to clone repository
        exit /b 1
    )

    :: Copy core files
    if exist "%INSTALL_DIR%\repo\core" (
        xcopy /s /e /i /y "%INSTALL_DIR%\repo\core" "%INSTALL_DIR%\core" >nul
    )
    if exist "%INSTALL_DIR%\repo\templates" (
        xcopy /s /e /i /y "%INSTALL_DIR%\repo\templates" "%INSTALL_DIR%\templates" >nul
    )
    if exist "%INSTALL_DIR%\repo\mcp" (
        xcopy /s /e /i /y "%INSTALL_DIR%\repo\mcp" "%INSTALL_DIR%\mcp" >nul
    )

    :: Fallback: copy old structure
    if not exist "%INSTALL_DIR%\core" (
        mkdir "%INSTALL_DIR%\core" 2>nul
        if exist "%INSTALL_DIR%\repo\tower" xcopy /s /e /i /y "%INSTALL_DIR%\repo\tower" "%INSTALL_DIR%\core\tower" >nul
        if exist "%INSTALL_DIR%\repo\familiars" xcopy /s /e /i /y "%INSTALL_DIR%\repo\familiars" "%INSTALL_DIR%\core\familiars" >nul
        if exist "%INSTALL_DIR%\repo\spells" xcopy /s /e /i /y "%INSTALL_DIR%\repo\spells" "%INSTALL_DIR%\core\spells" >nul
        if exist "%INSTALL_DIR%\repo\runes\rules" xcopy /s /e /i /y "%INSTALL_DIR%\repo\runes\rules" "%INSTALL_DIR%\core\rules" >nul
        if exist "%INSTALL_DIR%\repo\runes\mcp" xcopy /s /e /i /y "%INSTALL_DIR%\repo\runes\mcp" "%INSTALL_DIR%\mcp" >nul
        if exist "%INSTALL_DIR%\repo\registry\templates" xcopy /s /e /i /y "%INSTALL_DIR%\repo\registry\templates" "%INSTALL_DIR%\templates" >nul
    )

    rmdir /s /q "%INSTALL_DIR%\repo"
)

echo %VERSION% > "%INSTALL_DIR%\version"
echo [OK] Downloaded to %INSTALL_DIR%

:: Set up PATH
echo.
echo Setting up PATH...

set BIN_DIR=%INSTALL_DIR%\bin
mkdir "%BIN_DIR%" 2>nul

:: Create CLI wrapper
(
echo @echo off
echo setlocal
echo.
echo if "%%GRIMOIRES_HOME%%"=="" set GRIMOIRES_HOME=%%USERPROFILE%%\.grimoires
echo.
echo if "%%1"=="version" goto :version
echo if "%%1"=="-v" goto :version
echo if "%%1"=="--version" goto :version
echo if "%%1"=="update" goto :update
echo if "%%1"=="uninstall" goto :uninstall
echo if "%%1"=="doctor" goto :doctor
echo if "%%1"=="init" goto :init
echo goto :help
echo.
echo :version
echo if exist "%%GRIMOIRES_HOME%%\version" ^(
echo     set /p VER=^<"%%GRIMOIRES_HOME%%\version"
echo     echo Grimoires v%%VER%%
echo ^) else ^(
echo     echo Grimoires ^(version unknown^)
echo ^)
echo goto :eof
echo.
echo :update
echo echo Updating Grimoires...
echo powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/bluelucifer/Grimoires/main/scripts/install.ps1 ^| iex"
echo goto :eof
echo.
echo :uninstall
echo echo Running uninstaller...
echo powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/bluelucifer/Grimoires/main/scripts/uninstall.ps1 ^| iex"
echo goto :eof
echo.
echo :doctor
echo echo Checking Grimoires installation...
echo echo.
echo if exist "%%GRIMOIRES_HOME%%" ^(echo [OK] Installation directory: %%GRIMOIRES_HOME%%^) else ^(echo [ERROR] Installation directory not found ^& exit /b 1^)
echo if exist "%%GRIMOIRES_HOME%%\version" ^(set /p VER=^<"%%GRIMOIRES_HOME%%\version" ^& echo [OK] Version: %%VER%%^) else ^(echo [WARN] Version file not found^)
echo if exist "%%GRIMOIRES_HOME%%\core" ^(echo [OK] core\ exists^) else ^(echo [WARN] core\ not found^)
echo if exist "%%GRIMOIRES_HOME%%\templates" ^(echo [OK] templates\ exists^) else ^(echo [WARN] templates\ not found^)
echo if exist "%%GRIMOIRES_HOME%%\mcp" ^(echo [OK] mcp\ exists^) else ^(echo [WARN] mcp\ not found^)
echo where claude ^>nul 2^>nul ^&^& ^(echo [OK] Claude Code CLI available^) ^|^| ^(echo [WARN] Claude Code CLI not found^)
echo echo.
echo echo Installation health check complete.
echo goto :eof
echo.
echo :init
echo echo To initialize Grimoires in a project, use Claude Code:
echo echo   1. Open Claude Code in your project directory
echo echo   2. Run: /cast:summon
echo goto :eof
echo.
echo :help
echo echo Grimoires - Multi-AI Agent Orchestration for Claude Code
echo echo.
echo echo Usage: grimoires [command]
echo echo.
echo echo Commands:
echo echo     version     Show installed version
echo echo     update      Update to latest version
echo echo     uninstall   Remove Grimoires from system
echo echo     doctor      Check installation health
echo echo     help        Show this help message
echo echo.
echo echo For more information: https://github.com/bluelucifer/Grimoires
echo goto :eof
) > "%BIN_DIR%\grimoires.cmd"

:: Set environment variables (user level)
setx GRIMOIRES_HOME "%INSTALL_DIR%" >nul 2>&1

:: Add to PATH
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set CURRENT_PATH=%%b
echo %CURRENT_PATH% | findstr /i "%BIN_DIR%" >nul
if %ERRORLEVEL% neq 0 (
    setx PATH "%BIN_DIR%;%CURRENT_PATH%" >nul 2>&1
    echo [OK] Added to PATH
) else (
    echo [INFO] PATH already configured
)

:: Create global config
echo.
echo Creating global configuration...

if not exist "%INSTALL_DIR%\config.yaml" (
    (
    echo # Grimoires Global Configuration
    echo # https://github.com/bluelucifer/Grimoires
    echo.
    echo version: "%VERSION%"
    echo.
    echo api_keys:
    echo   openai: ${OPENAI_API_KEY}
    echo   google: ${GOOGLE_API_KEY}
    echo   figma: ${FIGMA_ACCESS_TOKEN}
    echo.
    echo defaults:
    echo   preset: auto
    echo   auto_init: true
    echo   parallel_limit: 4
    echo   familiars:
    echo     - codex
    echo     - gemini
    echo     - reviewer
    echo.
    echo cost:
    echo   enabled: false
    echo   daily_budget: 10.00
    echo   alerts: true
    echo.
    echo updates:
    echo   auto_check: true
    echo   channel: stable
    ) > "%INSTALL_DIR%\config.yaml"
    echo [OK] Configuration created
) else (
    echo [INFO] Configuration already exists
)

:: Success message
echo.
echo =============================================
echo   Grimoires installed successfully!
echo =============================================
echo.
echo   Installation:
echo     Location: %INSTALL_DIR%
echo     Version:  %VERSION%
echo.
echo   Quick Start:
echo     1. Open a new terminal window
echo     2. Navigate to your project directory
echo     3. Run any /cast: command in Claude Code
echo.
echo   Commands in Claude Code:
echo     /cast:summon    - Initialize Grimoires for project
echo     /cast:dev       - Start development workflow
echo     /cast:review    - Code review
echo.
echo   CLI Commands:
echo     grimoires version   - Show version
echo     grimoires doctor    - Check installation
echo     grimoires update    - Update Grimoires
echo     grimoires uninstall - Remove Grimoires
echo.
echo   Documentation:
echo     https://github.com/bluelucifer/Grimoires
echo.

endlocal
