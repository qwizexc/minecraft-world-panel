@echo off
chcp 65001 >nul
title Minecraft Server Panel Launcher

echo [System] Запуск бэкенд сервера из папки panel...
cd panel
start cmd /k "node server.js"

echo [System] Ожидание запуска сервера...
timeout /t 2 /nobreak >nul

echo [System] Открытие панели в браузере...
start http://localhost:3000

exit