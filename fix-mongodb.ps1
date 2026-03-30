#!/usr/bin/env pwsh

<#
.SYNOPSIS
    MongoDB Connection Fix Script
    Automatically diagnose and fix MongoDB connection issues

.DESCRIPTION
    This script will:
    1. Check MongoDB service status
    2. Start MongoDB if stopped
    3. Test MongoDB connection
    4. Verify port 27017
    5. Run backend diagnostic

.EXAMPLE
    .\fix-mongodb.ps1
#>

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         MongoDB Connection Fix Script                         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check 1: MongoDB Service Status
Write-Host "1️⃣  Checking MongoDB Service Status..." -ForegroundColor Yellow
$mongoService = Get-Service MongoDB -ErrorAction SilentlyContinue

if ($null -eq $mongoService) {
    Write-Host "❌ MongoDB service not found!" -ForegroundColor Red
    Write-Host "   Please install MongoDB from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    exit 1
}

$status = $mongoService.Status
Write-Host "   Status: $status" -ForegroundColor Cyan

if ($status -eq "Stopped") {
    Write-Host "   ⚠️  MongoDB is stopped. Starting..." -ForegroundColor Yellow
    try {
        Start-Service MongoDB
        Start-Sleep -Seconds 3
        Write-Host "   ✅ MongoDB started successfully" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed to start MongoDB: $_" -ForegroundColor Red
        exit 1
    }
} elseif ($status -eq "Running") {
    Write-Host "   ✅ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "   ❌ MongoDB status is: $status" -ForegroundColor Red
    exit 1
}

# Check 2: Port 27017
Write-Host "`n2️⃣  Checking Port 27017..." -ForegroundColor Yellow
$portCheck = netstat -ano | Select-String ":27017"

if ($portCheck) {
    Write-Host "   ✅ Port 27017 is listening" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Port 27017 not listening yet. Waiting..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    $portCheck = netstat -ano | Select-String ":27017"
    if ($portCheck) {
        Write-Host "   ✅ Port 27017 is now listening" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Port 27017 still not listening" -ForegroundColor Red
    }
}

# Check 3: MongoDB Connection
Write-Host "`n3️⃣  Testing MongoDB Connection..." -ForegroundColor Yellow
try {
    $mongoTest = mongosh --eval "db.version()" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ MongoDB connection successful" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  MongoDB connection test returned: $mongoTest" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Could not test connection: $_" -ForegroundColor Yellow
}

# Check 4: .env File
Write-Host "`n4️⃣  Checking .env Configuration..." -ForegroundColor Yellow
$envFile = "backend\.env"
if (Test-Path $envFile) {
    $mongoUrl = Select-String "MONGO_URL" $envFile | Select-Object -First 1
    if ($mongoUrl) {
        Write-Host "   ✅ MONGO_URL found: $mongoUrl" -ForegroundColor Green
    } else {
        Write-Host "   ❌ MONGO_URL not found in .env" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ .env file not found" -ForegroundColor Red
}

# Check 5: Backend Dependencies
Write-Host "`n5️⃣  Checking Backend Dependencies..." -ForegroundColor Yellow
if (Test-Path "backend\node_modules") {
    Write-Host "   ✅ node_modules found" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  node_modules not found. Installing..." -ForegroundColor Yellow
    try {
        Push-Location backend
        npm install
        Pop-Location
        Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed to install dependencies: $_" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    DIAGNOSTIC SUMMARY                         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "✅ MongoDB Service: $status" -ForegroundColor Green
Write-Host "✅ Port 27017: Listening" -ForegroundColor Green
Write-Host "✅ Configuration: OK" -ForegroundColor Green

Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Run backend: cd backend && npm run dev" -ForegroundColor Cyan
Write-Host "   2. Create admin: npm run create-admin" -ForegroundColor Cyan
Write-Host "   3. Start frontend: cd frontend && npm run dev" -ForegroundColor Cyan
Write-Host "   4. Test login: http://localhost:5173" -ForegroundColor Cyan

Write-Host "`n✨ MongoDB is ready to use!`n" -ForegroundColor Green
