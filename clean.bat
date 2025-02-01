@echo off
rmdir /s /q node_modules
del /f package-lock.json
npm cache clean --force
npm install