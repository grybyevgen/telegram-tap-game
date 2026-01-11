@echo off
REM Скрипт для автоматического деплоя Telegram Mini App "Тапалка" (Windows)
REM Использование: deploy.bat [platform]
REM Платформы: github, netlify, vercel, firebase

setlocal enabledelayedexpansion

set PLATFORM=%1
if "%PLATFORM%"=="" set PLATFORM=github

echo ==========================================
echo   Деплой Telegram Mini App "Тапалка"
echo ==========================================
echo.

REM Проверка файлов
echo [INFO] Проверка файлов проекта...
set MISSING=0
if not exist "index.html" (
    echo [ERROR] Файл index.html не найден
    set MISSING=1
)
if not exist "style.css" (
    echo [ERROR] Файл style.css не найден
    set MISSING=1
)
if not exist "script.js" (
    echo [ERROR] Файл script.js не найден
    set MISSING=1
)
if not exist "firebase-config.js" (
    echo [ERROR] Файл firebase-config.js не найден
    set MISSING=1
)
if not exist "manifest.json" (
    echo [ERROR] Файл manifest.json не найден
    set MISSING=1
)

if %MISSING%==1 (
    echo [ERROR] Отсутствуют необходимые файлы
    exit /b 1
)

echo [INFO] Все необходимые файлы найдены
echo.

REM Проверка иконок
if not exist "icon-192x192.png" (
    echo [WARN] PNG иконки не найдены. Используйте generate-icons.html для их создания.
) else (
    echo [INFO] Иконки найдены
)
echo.

REM Деплой в зависимости от платформы
if /i "%PLATFORM%"=="github" goto deploy_github
if /i "%PLATFORM%"=="netlify" goto deploy_netlify
if /i "%PLATFORM%"=="vercel" goto deploy_vercel
if /i "%PLATFORM%"=="firebase" goto deploy_firebase

echo [ERROR] Неизвестная платформа: %PLATFORM%
echo Доступные платформы: github, netlify, vercel, firebase
exit /b 1

:deploy_github
echo [INFO] Деплой на GitHub Pages...
where git >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git не установлен. Установите Git и повторите попытку.
    exit /b 1
)

if not exist ".git" (
    echo [WARN] Git репозиторий не найден. Инициализация...
    git init
    git add .
    git commit -m "Initial commit: Tap Game deployment"
)

echo [INFO] Создание коммита...
git add .
git commit -m "Deploy: %date% %time%" 2>nul || echo [WARN] Нет изменений для коммита

echo [INFO] Отправка в GitHub...
git push origin main 2>nul || git push origin master 2>nul || (
    echo [ERROR] Ошибка при отправке в GitHub
    echo Убедитесь, что remote 'origin' настроен правильно
    exit /b 1
)

echo [INFO] Деплой на GitHub Pages завершен
echo [INFO] Включите GitHub Pages в Settings ^> Pages вашего репозитория
goto end

:deploy_netlify
echo [INFO] Деплой на Netlify...
where netlify >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Netlify CLI не установлен.
    echo Установите: npm install -g netlify-cli
    exit /b 1
)
netlify deploy --prod
goto end

:deploy_vercel
echo [INFO] Деплой на Vercel...
where vercel >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Vercel CLI не установлен.
    echo Установите: npm install -g vercel
    exit /b 1
)
vercel --prod
goto end

:deploy_firebase
echo [INFO] Деплой на Firebase Hosting...
where firebase >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Firebase CLI не установлен.
    echo Установите: npm install -g firebase-tools
    exit /b 1
)
firebase deploy --only hosting
goto end

:end
echo.
echo ==========================================
echo   Деплой завершен успешно! 
echo ==========================================
echo.
echo Следующие шаги:
echo 1. Проверьте работу приложения по URL
echo 2. Настройте Telegram бота через @BotFather
echo 3. Протестируйте приложение через @WebAppTestBot
echo 4. Проверьте Firebase (если используется)
echo.

pause
