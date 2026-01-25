#Requires -Version 5.1
# ============================================================
# Grimoires Uninstaller for Windows PowerShell
# ============================================================

$ErrorActionPreference = "Stop"
$InstallDir = if ($env:GRIMOIRES_HOME) { $env:GRIMOIRES_HOME } else { "$env:USERPROFILE\.grimoires" }

Write-Host ""
Write-Host "  +=============================================+" -ForegroundColor Yellow
Write-Host "  |       GRIMOIRES UNINSTALLER                 |" -ForegroundColor Yellow
Write-Host "  +=============================================+" -ForegroundColor Yellow
Write-Host ""

Write-Host "This will remove:" -ForegroundColor Cyan
Write-Host "  - Installation directory: $InstallDir"
Write-Host "  - PATH and environment variable configuration"
Write-Host ""
Write-Host "This will NOT remove:" -ForegroundColor Cyan
Write-Host "  - Project-local grimoire.yaml files"
Write-Host "  - Project-local .serena\ directories (optional)"
Write-Host ""

# Confirm
$confirm = Read-Host "Remove Grimoires from $InstallDir? [y/N]"
if ($confirm -ne 'y') {
    Write-Host "Cancelled."
    exit 0
}

Write-Host ""

# Remove installation directory
if (Test-Path $InstallDir) {
    Remove-Item -Path $InstallDir -Recurse -Force
    Write-Host "[OK] Removed $InstallDir" -ForegroundColor Green
}
else {
    Write-Host "[WARN] Directory not found: $InstallDir" -ForegroundColor Yellow
}

# Clean environment variables
$binDir = "$InstallDir\bin"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ($currentPath -like "*$binDir*") {
    # Remove bin directory from PATH
    $pathParts = $currentPath.Split(';') | Where-Object { $_ -ne $binDir -and $_ -ne "" }
    $newPath = $pathParts -join ';'
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "[OK] Removed from PATH" -ForegroundColor Green
}

# Remove GRIMOIRES_HOME environment variable
if ([Environment]::GetEnvironmentVariable("GRIMOIRES_HOME", "User")) {
    [Environment]::SetEnvironmentVariable("GRIMOIRES_HOME", $null, "User")
    Write-Host "[OK] Removed GRIMOIRES_HOME environment variable" -ForegroundColor Green
}

# Update current session
$env:GRIMOIRES_HOME = $null

# Ask about project-local .grimoires directories
Write-Host ""
$cleanProjects = Read-Host "Search for and remove project-local .grimoires\ directories? [y/N]"
if ($cleanProjects -eq 'y') {
    Write-Host "Searching for project directories..."
    $foundDirs = 0

    # Search common development directories
    $searchPaths = @(
        "$env:USERPROFILE\Projects",
        "$env:USERPROFILE\projects",
        "$env:USERPROFILE\Development",
        "$env:USERPROFILE\dev",
        "$env:USERPROFILE\code",
        "$env:USERPROFILE\workspace",
        "$env:USERPROFILE\src",
        "$env:USERPROFILE\Documents\Projects",
        "$env:USERPROFILE\Documents\GitHub"
    )

    foreach ($searchPath in $searchPaths) {
        if (Test-Path $searchPath) {
            Get-ChildItem -Path $searchPath -Recurse -Directory -Filter ".grimoires" -Depth 4 -ErrorAction SilentlyContinue | ForEach-Object {
                Remove-Item -Path $_.FullName -Recurse -Force
                Write-Host "  [OK] Removed $($_.FullName)" -ForegroundColor Green
                $foundDirs++
            }
        }
    }

    if ($foundDirs -eq 0) {
        Write-Host "  No .grimoires\ directories found in common locations."
    }
    else {
        Write-Host "  Removed $foundDirs directories" -ForegroundColor Green
    }
}

# Ask about .serena directories
Write-Host ""
$cleanSerena = Read-Host "Search for and remove .serena\ directories (memory storage)? [y/N]"
if ($cleanSerena -eq 'y') {
    Write-Host "Searching for .serena directories..."
    $foundDirs = 0

    $searchPaths = @(
        "$env:USERPROFILE\Projects",
        "$env:USERPROFILE\projects",
        "$env:USERPROFILE\Development",
        "$env:USERPROFILE\dev",
        "$env:USERPROFILE\code",
        "$env:USERPROFILE\workspace",
        "$env:USERPROFILE\src",
        "$env:USERPROFILE\Documents\Projects",
        "$env:USERPROFILE\Documents\GitHub"
    )

    foreach ($searchPath in $searchPaths) {
        if (Test-Path $searchPath) {
            Get-ChildItem -Path $searchPath -Recurse -Directory -Filter ".serena" -Depth 4 -ErrorAction SilentlyContinue | ForEach-Object {
                Remove-Item -Path $_.FullName -Recurse -Force
                Write-Host "  [OK] Removed $($_.FullName)" -ForegroundColor Green
                $foundDirs++
            }
        }
    }

    if ($foundDirs -eq 0) {
        Write-Host "  No .serena\ directories found in common locations."
    }
    else {
        Write-Host "  Removed $foundDirs directories" -ForegroundColor Green
    }
}

# Success message
Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  Grimoires uninstalled successfully!       " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Notes:"
Write-Host "  - Project grimoire.yaml files were preserved."
Write-Host "    Delete them manually if no longer needed."
Write-Host ""
Write-Host "  - Open a new terminal for PATH changes to take effect."
Write-Host ""
Write-Host "Thank you for using Grimoires!"
Write-Host ""
