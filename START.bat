@echo off
echo ====================================
echo FindMyProfessor - Startup Script
echo ====================================
echo.

REM Check if running in project directory
if not exist "package.json" (
    echo ERROR: Please run this script from the project root directory!
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo [1/4] Checking prerequisites...
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] Node.js not found! Please install Node.js first.
    pause
    exit /b 1
) else (
    echo [OK] Node.js found
)

REM Check PHP
where php >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] PHP not found! Please install PHP first.
    pause
    exit /b 1
) else (
    echo [OK] PHP found
)

echo.
echo [2/4] Checking configuration files...
echo.

REM Check .env files
if not exist ".env" (
    echo [!] .env file not found - using defaults
)

if not exist "backend\node\.env" (
    echo [!] Creating backend\node\.env with defaults...
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
)

echo [OK] Configuration files ready
echo.

echo [3/4] Starting servers...
echo.
echo This will open 3 terminal windows:
echo   - PHP API Server (Port 8000)
echo   - Node.js Chatbot Server (Port 5000)
echo   - React Dev Server (Port 5173)
echo.

pause

REM Start PHP Server
echo Starting PHP API Server...
start "PHP API Server" cmd /k "cd backend\php && php -S 0.0.0.0:8000"
timeout /t 2 /nobreak >nul

REM Start Node.js Chatbot Server
echo Starting Node.js Chatbot Server...
start "Node.js Chatbot Server" cmd /k "cd backend\node && node chatbot-server.js"
timeout /t 3 /nobreak >nul

REM Start React Dev Server
echo Starting React Dev Server...
start "React Dev Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo [4/4] All servers started!
echo.
echo ====================================
echo FindMyProfessor is now running!
echo ====================================
echo.
echo Access the application locally:
echo   - Student View:  http://localhost:5173/
echo   - Admin Login:   http://localhost:5173/admin/login
echo.
echo Access from other devices on your network:
echo   1. Find your IP: Open CMD and type "ipconfig"
echo   2. Look for "IPv4 Address" (e.g., 192.168.1.100)
echo   3. Access at: http://YOUR-IP:5173/
echo.
echo   Example: http://192.168.1.100:5173/
echo.
echo APIs:
echo   - PHP API:       http://localhost:8000/api
echo   - Chatbot API:   http://localhost:5000
echo.
echo Default admin credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo Opening browser automatically in 3 seconds...

timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo Browser opened! Application is ready.
echo To stop all servers, close the 3 terminal windows.
echo.
pause
