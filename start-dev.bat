@echo off
setlocal enabledelayedexpansion

REM Synergy Well - Development Environment Startup Script (Windows)
REM This script starts all required services for the platform

echo [INFO] Starting Synergy Well Development Environment

REM Configuration
set FRONTEND_PORT=8080
set BACKEND_PORT=3001
set MONGODB_PORT=27017

REM Check if ports are in use
netstat -an | find ":%FRONTEND_PORT%" | find "LISTENING" >nul
if !errorlevel! == 0 (
    echo [WARNING] Frontend port %FRONTEND_PORT% is already in use
    set /p choice="Kill existing process? (y/N): "
    if /i "!choice!" == "y" (
        for /f "tokens=5" %%a in ('netstat -ano ^| find ":%FRONTEND_PORT%" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
        echo [SUCCESS] Killed existing process on port %FRONTEND_PORT%
    ) else (
        echo [ERROR] Cannot start frontend - port %FRONTEND_PORT% is occupied
        pause
        exit /b 1
    )
)

netstat -an | find ":%BACKEND_PORT%" | find "LISTENING" >nul
if !errorlevel! == 0 (
    echo [WARNING] Backend port %BACKEND_PORT% is already in use
    set /p choice="Kill existing process? (y/N): "
    if /i "!choice!" == "y" (
        for /f "tokens=5" %%a in ('netstat -ano ^| find ":%BACKEND_PORT%" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
        echo [SUCCESS] Killed existing process on port %BACKEND_PORT%
    ) else (
        echo [ERROR] Cannot start backend - port %BACKEND_PORT% is occupied
        pause
        exit /b 1
    )
)

REM Check MongoDB
echo [INFO] Checking MongoDB connection...
mongosh --host localhost:%MONGODB_PORT% --eval "db.runCommand('ping')" >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] MongoDB is not running on port %MONGODB_PORT%
    echo Please start MongoDB and try again
    pause
    exit /b 1
)
echo [SUCCESS] MongoDB is running

REM Install dependencies
if not exist "node_modules" (
    echo [INFO] Installing frontend dependencies...
    call npm install
)

if not exist "backend\node_modules" (
    echo [INFO] Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

REM Create logs directory
if not exist "logs" mkdir logs

REM Start Backend
echo [INFO] Starting Backend Server (Port: %BACKEND_PORT%)...
cd backend
start /b cmd /c "npm run dev > ..\logs\backend.log 2>&1"
cd ..

REM Wait for backend
echo [INFO] Waiting for backend to start...
timeout /t 5 /nobreak >nul

REM Start Frontend
echo [INFO] Starting Frontend Server (Port: %FRONTEND_PORT%)...
start /b cmd /c "npm run dev > logs\frontend.log 2>&1"

REM Wait for frontend
echo [INFO] Waiting for frontend to start...
timeout /t 5 /nobreak >nul

echo.
echo [SUCCESS] All services are starting!
echo.
echo Frontend:  http://localhost:%FRONTEND_PORT%
echo Backend:   http://localhost:%BACKEND_PORT%
echo MongoDB:   mongodb://localhost:%MONGODB_PORT%
echo.
echo Press any key to stop all services...
pause >nul

REM Cleanup
echo [INFO] Stopping services...
taskkill /f /im node.exe >nul 2>&1
echo [SUCCESS] Services stopped

endlocal
