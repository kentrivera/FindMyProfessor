@echo off
echo ================================
echo Installing Python Dependencies
echo ================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

echo Installing required packages...
pip install -r requirements.txt

echo.
echo ================================
echo Downloading NLTK Data
echo ================================
python -c "import nltk; nltk.download('punkt'); nltk.download('averaged_perceptron_tagger'); nltk.download('brown')"

echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo To start the chatbot server, run: python app.py
echo.
pause
