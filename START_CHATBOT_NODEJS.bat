@echo off
echo ===============================================
echo   FindMyProfessor AI Chatbot Server (Node.js)
echo ===============================================
echo.
echo Starting Node.js chatbot server...
echo.

cd backend\node

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo.
        echo Installation failed. Please check the errors above.
        pause
        exit /b 1
    )
)

:: Start the server
echo.
echo Starting chatbot server on port 5000...
node chatbot-server.js

pause
