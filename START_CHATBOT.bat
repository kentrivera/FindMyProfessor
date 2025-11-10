@echo off
echo ===============================================
echo   FindMyProfessor AI Chatbot Server
echo ===============================================
echo.
echo Starting Python chatbot server...
echo.

cd backend\python

:: Check if virtual environment exists
if not exist "venv" (
    echo Virtual environment not found. Running setup...
    call setup.bat
    if errorlevel 1 (
        echo.
        echo Setup failed. Please check the errors above.
        pause
        exit /b 1
    )
)

:: Activate virtual environment and start server
echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Starting Flask server on port 5000...
python app.py

pause
