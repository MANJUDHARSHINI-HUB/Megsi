@echo off
cd /d "%~dp0"
if not exist node_modules\vite (
  echo Installing dependencies...
  call npm install
)
echo Starting MEG-SI... (press Ctrl+C to stop)
call npm run dev -- --open
pause
