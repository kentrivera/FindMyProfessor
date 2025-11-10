@echo off
echo ====================================
echo Stopping FindMyProfessor Servers
echo ====================================
echo.

echo Stopping all Node.js processes (React)...
taskkill /F /IM node.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] React dev server stopped
) else (
    echo [!] No React server running
)

echo.
echo Stopping all PHP processes...
taskkill /F /IM php.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] PHP server stopped
) else (
    echo [!] No PHP server running
)

echo.
echo Stopping all Python processes...
taskkill /F /IM python.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python server stopped
) else (
    echo [!] No Python server running
)

echo.
echo ====================================
echo All servers stopped!
echo ====================================
echo.
pause
