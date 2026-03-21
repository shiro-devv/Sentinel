# Disaster Detector - PowerShell Startup Script
# Run this file to start the entire system

#Requires -Version 5.1

$ErrorActionPreference = "Stop"

# Colors
$Green = "`e[32m"
$Yellow = "`e[33m"
$Red = "`e[31m"
$Cyan = "`e[36m"
$Reset = "`e[0m"

Write-Host ""
Write-Host "${Cyan}========================================${Reset}"
Write-Host "${Cyan}  DISASTER DETECTOR - PowerShell Setup  ${Reset}"
Write-Host "${Cyan}========================================${Reset}"
Write-Host ""

# Check Docker
Write-Host "${Yellow}[1/6] Checking Docker...${Reset}"
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "${Green}[OK] $dockerVersion${Reset}"
} catch {
    Write-Host "${Red}[ERROR] Docker not found!${Reset}"
    Write-Host "Please install Docker Desktop from https://www.docker.com/"
    Read-Host "Press Enter to exit"
    exit 1
}

# Check Docker Compose
Write-Host "${Yellow}[2/6] Checking Docker Compose...${Reset}"
try {
    docker compose version 2>&1 | Out-Null
    $ComposeCmd = "docker compose"
    Write-Host "${Green}[OK] Docker Compose (v2) found${Reset}"
} catch {
    try {
        docker-compose --version 2>&1 | Out-Null
        $ComposeCmd = "docker-compose"
        Write-Host "${Green}[OK] Docker Compose (v1) found${Reset}"
    } catch {
        Write-Host "${Red}[ERROR] Docker Compose not found!${Reset}"
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Check if running as administrator
Write-Host "${Yellow}[3/6] Checking permissions...${Reset}"
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if ($currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "${Green}[OK] Running as Administrator${Reset}"
} else {
    Write-Host "${Yellow}[WARN] Not running as Administrator (some features may be limited)${Reset}"
}

# Create .env if needed
Write-Host "${Yellow}[4/6] Setting up environment...${Reset}"
if (-not (Test-Path "backend\.env")) {
    Write-Host "${Yellow}Creating backend\.env from template...${Reset}"
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "${Green}[OK] Environment file created${Reset}"
    Write-Host "${Yellow}[INFO] Review backend\.env to add your API keys${Reset}"
} else {
    Write-Host "${Green}[OK] Environment file exists${Reset}"
}

# Create directories
$dirs = @("backend\logs", "infra\ssl")
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-Host "${Green}[OK] Directories ready${Reset}"

# Menu
Write-Host ""
Write-Host "${Cyan}========================================${Reset}"
Write-Host "${Cyan}  SELECT RUN MODE                       ${Reset}"
Write-Host "${Cyan}========================================${Reset}"
Write-Host ""
Write-Host "  ${Green}1${Reset}. Full Docker Mode (Recommended)"
Write-Host "  ${Green}2${Reset}. Stop All Services"
Write-Host "  ${Green}3${Reset}. View Logs"
Write-Host "  ${Green}4${Reset}. Check Status"
Write-Host "  ${Green}5${Reset}. Exit"
Write-Host ""
$choice = Read-Host "Enter choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "${Yellow}[5/6] Stopping existing services...${Reset}"
        Invoke-Expression "$ComposeCmd -f infra\docker-compose.yml down 2>`$null"
        
        Write-Host ""
        Write-Host "${Yellow}[6/6] Building and starting services...${Reset}"
        Invoke-Expression "$ComposeCmd -f infra\docker-compose.yml up -d --build"
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "${Red}[ERROR] Failed to start services${Reset}"
            Read-Host "Press Enter to exit"
            exit 1
        }
        
        Write-Host ""
        Write-Host "${Green}========================================${Reset}"
        Write-Host "${Green}  SERVICES STARTED SUCCESSFULLY!        ${Reset}"
        Write-Host "${Green}========================================${Reset}"
        Write-Host ""
        Write-Host "  ${Cyan}Frontend:${Reset}     http://localhost:3000"
        Write-Host "  ${Cyan}Backend API:${Reset}  http://localhost:8000"
        Write-Host "  ${Cyan}API Docs:${Reset}     http://localhost:8000/docs"
        Write-Host "  ${Cyan}PostgreSQL:${Reset}   localhost:5432"
        Write-Host "  ${Cyan}Redis:${Reset}        localhost:6379"
        Write-Host ""
        
        $openBrowser = Read-Host "Open application in browser? (Y/N)"
        if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
            Start-Process "http://localhost:3000"
        }
        
        $viewLogs = Read-Host "View logs? (Y/N)"
        if ($viewLogs -eq "Y" -or $viewLogs -eq "y") {
            Invoke-Expression "$ComposeCmd -f infra\docker-compose.yml logs -f --tail=100"
        }
    }
    "2" {
        Write-Host ""
        Write-Host "${Yellow}Stopping all services...${Reset}"
        Invoke-Expression "$ComposeCmd -f infra\docker-compose.yml down"
        Write-Host "${Green}[OK] All services stopped${Reset}"
    }
    "3" {
        Write-Host ""
        Write-Host "${Cyan}Select service:${Reset}"
        Write-Host "  1. All services"
        Write-Host "  2. Backend"
        Write-Host "  3. Worker"
        Write-Host "  4. PostgreSQL"
        Write-Host "  5. Redis"
        $logChoice = Read-Host "Choice"
        
        $service = switch ($logChoice) {
            "2" { "backend" }
            "3" { "celery-worker" }
            "4" { "postgres" }
            "5" { "redis" }
            default { "" }
        }
        
        if ($service) {
            Invoke-Expression "$ComposeCmd -f infra\docker-compose.yml logs -f --tail=100 $service"
        } else {
            Invoke-Expression "$ComposeCmd -f infra\docker-compose.yml logs -f --tail=100"
        }
    }
    "4" {
        Write-Host ""
        Write-Host "${Cyan}Service Status:${Reset}"
        Invoke-Expression "$ComposeCmd -f infra\docker-compose.yml ps"
        Read-Host "Press Enter to continue"
    }
    "5" {
        Write-Host "Goodbye!"
        exit 0
    }
    default {
        Write-Host "${Red}Invalid choice${Reset}"
    }
}

Write-Host ""
Write-Host "${Green}Done!${Reset}"
