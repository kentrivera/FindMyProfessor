@echo off
title FindMyProfessor - First Time Setup
color 0A

echo.
echo ========================================
echo   FindMyProfessor - First Time Setup
echo ========================================
echo.
echo This script will:
echo   1. Check prerequisites
echo   2. Install dependencies
echo   3. Configure environment
echo   4. Verify installation
echo.
pause

REM ==========================================
REM STEP 1: Check Prerequisites
REM ==========================================
echo.
echo ========================================
echo [STEP 1/5] Checking Prerequisites...
echo ========================================
echo.

set PREREQ_OK=1

echo Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] Node.js NOT FOUND
    echo     Please install from: https://nodejs.org/
    set PREREQ_OK=0
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Node.js found: %NODE_VERSION%
)

echo.
echo Checking PHP...
where php >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] PHP NOT FOUND
    echo     Please install PHP 8.0+ or use XAMPP
    set PREREQ_OK=0
) else (
    for /f "tokens=*" %%i in ('php --version ^| findstr /C:"PHP"') do set PHP_VERSION=%%i
    echo [OK] PHP found: %PHP_VERSION%
)

echo.
echo Checking MySQL...
sc query MySQL >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] MySQL service not detected
    echo     Make sure MySQL/XAMPP/WAMP is installed and running
) else (
    echo [OK] MySQL service detected
)

if %PREREQ_OK%==0 (
    echo.
    echo ========================================
    echo [ERROR] Missing prerequisites!
    echo ========================================
    echo Please install missing software and run this script again.
    pause
    exit /b 1
)

echo.
echo [OK] All prerequisites found!
pause

REM ==========================================
REM STEP 2: Install Frontend Dependencies
REM ==========================================
echo.
echo ========================================
echo [STEP 2/5] Installing Frontend Dependencies...
echo ========================================
echo.
echo This may take a few minutes...
echo.

npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Frontend dependency installation failed!
    echo Try running: npm install --legacy-peer-deps
    pause
    exit /b 1
)

echo.
echo [OK] Frontend dependencies installed!
pause

REM ==========================================
REM STEP 3: Install Backend Dependencies
REM ==========================================
echo.
echo ========================================
echo [STEP 3/5] Installing Backend Dependencies...
echo ========================================
echo.

cd backend\node

echo Installing Node.js backend dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend dependency installation failed!
    cd ..\..
    pause
    exit /b 1
)

cd ..\..

echo.
echo [OK] Backend dependencies installed!
pause

REM ==========================================
REM STEP 4: Configure Environment
REM ==========================================
echo.
echo ========================================
echo [STEP 4/5] Configuring Environment...
echo ========================================
echo.

if not exist ".env" (
    echo Creating frontend .env file...
    (
        echo VITE_API_URL=http://localhost:8000/api
        echo VITE_CHATBOT_API_URL=http://localhost:5000
    ) > .env
    echo [OK] Frontend .env created
) else (
    echo [!] Frontend .env already exists
)

if not exist "backend\node\.env" (
    echo Creating backend .env file...
    (
        echo # Database Configuration
        echo DB_HOST=localhost
        echo DB_NAME=findmyprofessor
        echo DB_USER=root
        echo DB_PASSWORD=
        echo.
        echo # Chatbot Server Port
        echo CHATBOT_PORT=5000
    ) > backend\node\.env
    echo [OK] Backend .env created
) else (
    echo [!] Backend .env already exists
)

echo.
echo Environment files ready!

echo.
echo ========================================
echo Database Configuration
echo ========================================
echo.
echo IMPORTANT: Make sure MySQL is running and then:
echo.
echo 1. Open phpMyAdmin (http://localhost/phpmyadmin)
echo 2. Create database named: findmyprofessor
echo 3. Import file: database\schema.sql
echo.
echo Default database credentials:
echo   Host: localhost
echo   User: root
echo   Pass: (leave empty for XAMPP)
echo.
set /p DB_READY="Have you set up the database? (Y/N): "

if /i not "%DB_READY%"=="Y" (
    echo.
    echo Please set up the database and run this script again.
    pause
    exit /b 0
)

pause

REM ==========================================
REM STEP 5: Verification
REM ==========================================
echo.
echo ========================================
echo [STEP 5/5] Installation Complete!
echo ========================================
echo.
echo Your FindMyProfessor installation is ready!
echo.
echo Next steps:
echo   1. Run START.bat to launch all servers
echo   2. Visit http://localhost:5173
echo   3. Login to admin: admin / admin123
echo.
echo Documentation:
echo   - Quick Start: QUICKSTART.md
echo   - Full Guide: README.md
echo   - Testing: TESTING_CHECKLIST.md
echo.
echo ========================================
echo.
set /p START_NOW="Start the application now? (Y/N): "

if /i "%START_NOW%"=="Y" (
    echo.
    echo Starting FindMyProfessor...
    call START.bat
) else (
    echo.
    echo To start later, run: START.bat
    echo.
    pause
)
