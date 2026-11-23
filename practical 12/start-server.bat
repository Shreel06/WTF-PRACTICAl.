@echo off
title City Library - Practical 12
echo ===================================================
echo   Starting City Library System Server...
echo ===================================================
start http://localhost:3000
node server.js
pause
