#!/bin/bash

# Скрипт для автоматического деплоя Telegram Mini App "Тапалка"
# Использование: ./deploy.sh [platform]
# Платформы: github, netlify, vercel, firebase

set -e  # Остановка при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка наличия необходимых файлов
check_files() {
    log_info "Проверка файлов проекта..."
    
    local required_files=("index.html" "style.css" "script.js" "firebase-config.js" "manifest.json")
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -ne 0 ]; then
        log_error "Отсутствуют файлы: ${missing_files[*]}"
        exit 1
    fi
    
    log_info "✓ Все необходимые файлы найдены"
}

# Проверка иконок
check_icons() {
    log_info "Проверка иконок..."
    
    if [ ! -f "icon-192x192.png" ] || [ ! -f "icon-512x512.png" ]; then
        log_warn "PNG иконки не найдены. Используйте generate-icons.html для их создания."
        log_warn "Продолжаю деплой без PNG иконок (будут использоваться SVG placeholder)..."
    else
        log_info "✓ Иконки найдены"
    fi
}

# Деплой на GitHub Pages
deploy_github() {
    log_info "Деплой на GitHub Pages..."
    
    # Проверка git
    if ! command -v git &> /dev/null; then
        log_error "Git не установлен. Установите Git и повторите попытку."
        exit 1
    fi
    
    # Проверка, что мы в git репозитории
    if [ ! -d ".git" ]; then
        log_warn "Не найден git репозиторий. Инициализирую..."
        git init
        git add .
        git commit -m "Initial commit: Tap Game deployment"
    fi
    
    # Проверка remote
    if ! git remote | grep -q "origin"; then
        log_warn "Remote 'origin' не настроен."
        read -p "Введите URL GitHub репозитория: " repo_url
        git remote add origin "$repo_url"
    fi
    
    # Коммит изменений
    log_info "Создание коммита..."
    git add .
    git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || log_warn "Нет изменений для коммита"
    
    # Пуш в репозиторий
    log_info "Отправка в GitHub..."
    git push origin main || git push origin master || {
        log_error "Ошибка при отправке в GitHub"
        exit 1
    }
    
    log_info "✓ Деплой на GitHub Pages завершен"
    log_info "Приложение будет доступно по адресу:"
    log_info "https://$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/' | tr ':' '/').github.io/tap-game/"
}

# Деплой на Netlify
deploy_netlify() {
    log_info "Деплой на Netlify..."
    
    if ! command -v netlify &> /dev/null; then
        log_error "Netlify CLI не установлен."
        log_info "Установите: npm install -g netlify-cli"
        exit 1
    fi
    
    # Проверка авторизации
    if ! netlify status &> /dev/null; then
        log_info "Авторизация в Netlify..."
        netlify login
    fi
    
    # Деплой
    log_info "Запуск деплоя..."
    netlify deploy --prod || {
        log_error "Ошибка деплоя на Netlify"
        exit 1
    }
    
    log_info "✓ Деплой на Netlify завершен"
}

# Деплой на Vercel
deploy_vercel() {
    log_info "Деплой на Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI не установлен."
        log_info "Установите: npm install -g vercel"
        exit 1
    fi
    
    # Деплой
    log_info "Запуск деплоя..."
    vercel --prod || {
        log_error "Ошибка деплоя на Vercel"
        exit 1
    }
    
    log_info "✓ Деплой на Vercel завершен"
}

# Деплой на Firebase Hosting
deploy_firebase() {
    log_info "Деплой на Firebase Hosting..."
    
    if ! command -v firebase &> /dev/null; then
        log_error "Firebase CLI не установлен."
        log_info "Установите: npm install -g firebase-tools"
        exit 1
    fi
    
    # Проверка авторизации
    if ! firebase projects:list &> /dev/null; then
        log_info "Авторизация в Firebase..."
        firebase login
    fi
    
    # Инициализация (если нужно)
    if [ ! -f "firebase.json" ]; then
        log_info "Инициализация Firebase..."
        firebase init hosting
    fi
    
    # Деплой
    log_info "Запуск деплоя..."
    firebase deploy --only hosting || {
        log_error "Ошибка деплоя на Firebase"
        exit 1
    }
    
    log_info "✓ Деплой на Firebase Hosting завершен"
}

# Основная функция
main() {
    log_info "=========================================="
    log_info "  Деплой Telegram Mini App 'Тапалка'"
    log_info "=========================================="
    echo ""
    
    # Проверка файлов
    check_files
    check_icons
    echo ""
    
    # Определение платформы
    PLATFORM=${1:-github}
    
    case $PLATFORM in
        github)
            deploy_github
            ;;
        netlify)
            deploy_netlify
            ;;
        vercel)
            deploy_vercel
            ;;
        firebase)
            deploy_firebase
            ;;
        *)
            log_error "Неизвестная платформа: $PLATFORM"
            log_info "Доступные платформы: github, netlify, vercel, firebase"
            log_info "Использование: ./deploy.sh [platform]"
            exit 1
            ;;
    esac
    
    echo ""
    log_info "=========================================="
    log_info "  Деплой завершен успешно! 🎉"
    log_info "=========================================="
    echo ""
    log_info "Следующие шаги:"
    log_info "1. Проверьте работу приложения по URL"
    log_info "2. Настройте Telegram бота через @BotFather"
    log_info "3. Протестируйте приложение через @WebAppTestBot"
    log_info "4. Проверьте Firebase (если используется)"
    echo ""
}

# Запуск
main "$@"
