@echo off
cd /d "%~dp0"
echo === Upload MY_COMPANY_TYCOON to GitHub ===
set "GIT=git"
where git >nul 2>nul
if not errorlevel 1 goto havegit
if exist "C:\Program Files\Git\cmd\git.exe" (
  set "GIT=C:\Program Files\Git\cmd\git.exe"
  goto havegit
)
echo Installing Git for Windows with winget... (please accept any Windows prompt)
echo INSTALLING_GIT > push_log.txt
echo Downloading Git installer...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue'; [Net.ServicePointManager]::SecurityProtocol='Tls12'; $r=Invoke-RestMethod 'https://api.github.com/repos/git-for-windows/git/releases/latest'; $a=$r.assets | Where-Object { $_.name -match '^Git-.*-64-bit\.exe$' } | Select-Object -First 1; Write-Output $a.browser_download_url; Invoke-WebRequest $a.browser_download_url -OutFile \"$env:TEMP\git-setup.exe\"" >> push_log.txt 2>&1
echo Installing Git (click Yes if Windows asks)...
powershell -NoProfile -Command "Start-Process -FilePath \"$env:TEMP\git-setup.exe\" -ArgumentList '/VERYSILENT','/NORESTART','/SP-' -Verb RunAs -Wait" >> push_log.txt 2>&1
if exist "C:\Program Files\Git\cmd\git.exe" (
  set "GIT=C:\Program Files\Git\cmd\git.exe"
  goto havegit
)
echo NO_GIT_AFTER_INSTALL >> push_log.txt
echo [X] Could not install Git. Install from https://git-scm.com/download/win then run this file again.
pause
exit /b 1

:havegit
if not exist ".git" "%GIT%" init -b main
"%GIT%" config user.name >nul 2>nul || "%GIT%" config user.name "Accoutment"
"%GIT%" config user.email >nul 2>nul || "%GIT%" config user.email "Accoutment@users.noreply.github.com"
"%GIT%" rm -r --cached -q --ignore-unmatch dist >nul 2>nul
findstr /x "push_log.txt" .gitignore >nul 2>nul || echo push_log.txt>>.gitignore
findstr /x "pull_log.txt" .gitignore >nul 2>nul || echo pull_log.txt>>.gitignore
"%GIT%" add -A
"%GIT%" commit -m "Add Co-op online mode" >nul 2>nul
"%GIT%" branch -M main
"%GIT%" remote remove origin >nul 2>nul
"%GIT%" remote add origin https://github.com/Accoutment/my-company-tycoon.git
echo Syncing with GitHub...
"%GIT%" pull --rebase --no-edit origin main > pull_log.txt 2>&1
if errorlevel 1 "%GIT%" rebase --abort >nul 2>nul
echo Pushing... a GitHub sign-in window may appear - please sign in.
"%GIT%" push -u origin main > push_log.txt 2>&1
set ERR=%errorlevel%
type push_log.txt
echo EXIT=%ERR%>> push_log.txt
if not "%ERR%"=="0" (
  echo.
  echo [X] Push failed - see the message above.
) else (
  echo.
  echo [OK] Done! https://github.com/Accoutment/my-company-tycoon
)
pause
