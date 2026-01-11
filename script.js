/* ============================================
   Глобальные переменные
   ============================================ */
let tg = null;
let gameState = {
    // Игровые данные
    coins: 0,
    totalTaps: 0,
    coinsPerClick: 1,
    clicksPerSecond: 0,
    
    // Данные пользователя
    userId: null,
    userName: 'Игрок',
    userAvatar: null,
    
    // Реферальная система
    referralCode: null,
    referredBy: null,
    referredByUserId: null,
    referralsCount: 0,
    referralBonus: 0,
    referrals: [], // Массив ID приглашенных пользователей
    isNewUser: true, // Флаг нового пользователя (для начисления бонуса рефереру)
    referralProcessed: false, // Флаг обработки реферального кода
    
        // Система улучшений
        purchasedUpgrades: [] // Массив ID купленных улучшений
};

// Система достижений (хранится отдельно)
let achievementsState = {
    achievements: [], // Массив ID полученных достижений
    showAchievements: true // Показывать достижения
};

// Ежедневный бонус (хранится отдельно)
let dailyBonusState = {
    lastBonusDate: null, // Дата последнего бонуса (timestamp)
    bonusStreak: 0, // Серия дней получения бонуса
    nextBonusTime: null // Время следующего доступного бонуса
};

// Настройки приложения
let appSettings = {
    notifications: true, // Уведомления о новых функциях
    version: '1.0.0', // Версия игры
    offlineMode: false, // Режим оффлайн
    lastSyncTime: null // Время последней синхронизации
};

// Массив доступных улучшений
const upgrades = [
    {
        id: 1,
        name: "Улучшенный клик",
        description: "+1 монета за клик",
        cost: 50,
        perClickIncrease: 1,
        icon: "⚡"
    },
    {
        id: 2,
        name: "Автокликер",
        description: "Автоматически кликает каждые 10 секунд (+10 монет)",
        cost: 200,
        autoClicker: true,
        autoClickAmount: 10,
        autoClickInterval: 10000, // 10 секунд
        icon: "🤖"
    },
    {
        id: 3,
        name: "Супер клик",
        description: "+2 монеты за клик",
        cost: 150,
        perClickIncrease: 2,
        icon: "💪",
        requires: [1] // Требует покупки улучшения с id: 1
    },
    {
        id: 4,
        name: "Турбо кликер",
        description: "Автоматически кликает каждые 5 секунд (+25 монет)",
        cost: 500,
        autoClicker: true,
        autoClickAmount: 25,
        autoClickInterval: 5000, // 5 секунд
        icon: "🚀",
        requires: [2] // Требует покупки улучшения с id: 2
    },
    {
        id: 5,
        name: "Мега клик",
        description: "+5 монет за клик",
        cost: 1000,
        perClickIncrease: 5,
        icon: "⭐",
        requires: [3] // Требует покупки улучшения с id: 3
    },
    {
        id: 6,
        name: "Ультра автокликер",
        description: "Автоматически кликает каждые 2 секунды (+50 монет)",
        cost: 2500,
        autoClicker: true,
        autoClickAmount: 50,
        autoClickInterval: 2000, // 2 секунды
        icon: "⚡",
        requires: [4] // Требует покупки улучшения с id: 4
    }
];

// Хранилище интервалов автокликеров
let autoClickerIntervals = [];

// Достижения системы
const achievements = [
    {
        id: 'first_tap',
        name: 'Первый шаг',
        description: 'Сделайте первый тап',
        icon: '👆',
        condition: (state) => state.totalTaps >= 1,
        reward: 10
    },
    {
        id: 'hundred_taps',
        name: 'Столбователь',
        description: 'Сделайте 100 тапов',
        icon: '💯',
        condition: (state) => state.totalTaps >= 100,
        reward: 50
    },
    {
        id: 'thousand_taps',
        name: 'Тысячник',
        description: 'Сделайте 1000 тапов',
        icon: '🔥',
        condition: (state) => state.totalTaps >= 1000,
        reward: 500
    },
    {
        id: 'first_coins',
        name: 'Первая монета',
        description: 'Заработайте первую монету',
        icon: '💰',
        condition: (state) => state.coins >= 1,
        reward: 5
    },
    {
        id: 'hundred_coins',
        name: 'Сотня',
        description: 'Накопите 100 монет',
        icon: '💵',
        condition: (state) => state.coins >= 100,
        reward: 25
    },
    {
        id: 'thousand_coins',
        name: 'Тысячник',
        description: 'Накопите 1000 монет',
        icon: '💎',
        condition: (state) => state.coins >= 1000,
        reward: 200
    },
    {
        id: 'first_upgrade',
        name: 'Улучшатель',
        description: 'Купите первое улучшение',
        icon: '⚡',
        condition: (state) => state.purchasedUpgrades.length >= 1,
        reward: 100
    },
    {
        id: 'all_upgrades',
        name: 'Мастер улучшений',
        description: 'Купите все улучшения',
        icon: '👑',
        condition: (state) => state.purchasedUpgrades.length >= upgrades.length,
        reward: 1000
    },
    {
        id: 'first_referral',
        name: 'Наставник',
        description: 'Пригласите первого друга',
        icon: '👥',
        condition: (state) => state.referralsCount >= 1,
        reward: 250
    },
    {
        id: 'five_referrals',
        name: 'Социальный',
        description: 'Пригласите 5 друзей',
        icon: '🌟',
        condition: (state) => state.referralsCount >= 5,
        reward: 500
    }
];

// Easter eggs
const easterEggs = {
    'КОННИЧИВА': () => {
        gameState.coins += 1000;
        showNotification('🎉 Easter Egg!', 'Получено 1000 монет!', 'success');
        return true;
    },
    'SECRET': () => {
        gameState.coins += 500;
        showNotification('🔑 Secret Code!', 'Получено 500 монет!', 'success');
        return true;
    }
};

// Ключи для localStorage
const STORAGE_KEYS = {
    GAME_STATE: 'tapGameState',
    USER_ID: 'tapGameUserId',
    REFERRAL_CODE: 'tapGameReferralCode'
};

/* ============================================
   Инициализация при загрузке страницы
   ============================================ */

// В начале script.js, после инициализации Telegram
console.log('Telegram:', window.Telegram);
console.log('WebApp:', window.Telegram?.WebApp);

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Инициализация игры...');
    
    // Таймаут для гарантированного завершения загрузки (10 секунд)
    const initTimeout = setTimeout(() => {
        console.warn('⚠️ Инициализация заняла слишком много времени, принудительно скрываем загрузку');
        try {
            hideLoading();
            // Показываем простое сообщение в консоли
            console.error('❌ Инициализация не завершилась за отведенное время');
        } catch (e) {
            console.error('❌ Ошибка при принудительном скрытии загрузки:', e);
            // Принудительно скрываем loading screen
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
            const appContainer = document.getElementById('appContainer');
            if (appContainer) {
                appContainer.style.opacity = '1';
            }
        }
    }, 10000);
    
    // Показываем loading screen
    showLoading('Инициализация...');
    
    try {
        // ВАЖНО: Устанавливаем userId в самом начале
        // Загружаем сохраненный userId из localStorage сначала
        const savedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        if (savedUserId && !gameState.userId) {
            try {
                gameState.userId = parseInt(savedUserId) || savedUserId;
            } catch (e) {
                gameState.userId = savedUserId;
            }
        }
        
        // Проверка онлайн/оффлайн статуса
        setupOfflineDetection();
        
        // Инициализация Telegram Web App
        updateLoadingText('Загрузка Telegram SDK...');
        
        // Дополнительная проверка Telegram WebApp
        if (!window.Telegram?.WebApp) {
            console.warn('⚠️ Telegram WebApp недоступен при инициализации');
            // Убеждаемся что userId установлен для тестового режима
            if (!gameState.userId) {
                createTestUser();
            }
            // Показываем сообщение для локального тестирования
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = '⚠️ Тестовый режим';
            }
            // Добавляем сообщение в body для тестового режима (только если еще нет)
            if (!document.querySelector('.test-mode-notice')) {
                const testModeDiv = document.createElement('div');
                testModeDiv.className = 'test-mode-notice';
                testModeDiv.style.cssText = 'background: #ffeb3b; padding: 10px; margin: 10px; border-radius: 5px; position: fixed; top: 80px; left: 10px; right: 10px; z-index: 9999;';
                testModeDiv.innerHTML = '<strong>Тестовый режим</strong><br>В Telegram боте будет работать полноценно';
                document.body.appendChild(testModeDiv);
            }
        } else {
            console.log('✅ Telegram WebApp найден при инициализации');
        }
        
        initTelegram();
        
        // Убеждаемся что userId установлен после initTelegram
        if (!gameState.userId) {
            console.warn('⚠️ userId не установлен после initTelegram, создаем тестового пользователя');
            createTestUser();
        }
        
        // Инициализация Firebase (если доступен)
        updateLoadingText('Подключение к Firebase...');
        try {
            await initFirebaseIfAvailable();
        } catch (error) {
            console.warn('⚠️ Ошибка инициализации Firebase (продолжаем работу):', error);
        }
        
        // Загрузка сохраненного прогресса
        updateLoadingText('Загрузка прогресса...');
        loadGameState();
        
        // Обработка реферального кода из URL (до генерации своего кода)
        updateLoadingText('Проверка реферальных ссылок...');
        try {
            await checkReferralFromURL();
        } catch (error) {
            console.warn('⚠️ Ошибка проверки реферального кода (продолжаем работу):', error);
        }
        
        // Генерация/загрузка реферального кода пользователя
        updateLoadingText('Генерация реферального кода...');
        try {
            await ensureReferralCode();
        } catch (error) {
            console.warn('⚠️ Ошибка генерации реферального кода (продолжаем работу):', error);
        }
        
        // Загрузка данных из Firebase (если доступен)
        updateLoadingText('Синхронизация данных...');
        try {
            await loadDataFromFirebase();
        } catch (error) {
            console.warn('⚠️ Ошибка загрузки данных из Firebase (продолжаем работу):', error);
        }
        
        // Настройка обработчиков событий
        updateLoadingText('Настройка интерфейса...');
        setupEventListeners();
        
        // Генерация реферальной ссылки
        try {
            generateReferralLink();
        } catch (error) {
            console.warn('⚠️ Ошибка генерации реферальной ссылки:', error);
        }
        
        // Инициализация системы улучшений
        try {
            initUpgrades();
        } catch (error) {
            console.warn('⚠️ Ошибка инициализации улучшений:', error);
        }
        
        // Инициализация системы достижений
        try {
            initAchievements();
        } catch (error) {
            console.warn('⚠️ Ошибка инициализации достижений:', error);
        }
        
        // Инициализация ежедневного бонуса
        try {
            initDailyBonus();
        } catch (error) {
            console.warn('⚠️ Ошибка инициализации ежедневного бонуса:', error);
        }
        
        // Проверка достижений
        try {
            checkAchievements();
        } catch (error) {
            console.warn('⚠️ Ошибка проверки достижений:', error);
        }
        
        // Проверка обновлений
        try {
            checkForUpdates();
        } catch (error) {
            console.warn('⚠️ Ошибка проверки обновлений:', error);
        }
        
        // Регистрация Service Worker для PWA
        try {
            registerServiceWorker();
        } catch (error) {
            console.warn('⚠️ Ошибка регистрации Service Worker:', error);
        }
        
        // Обновление интерфейса
        updateLoadingText('Финальная настройка...');
        try {
            updateUI();
        } catch (error) {
            console.warn('⚠️ Ошибка обновления UI:', error);
        }
        
        // Загрузка истории рефералов
        try {
            await loadReferralHistory();
        } catch (error) {
            console.warn('⚠️ Ошибка загрузки истории рефералов (продолжаем работу):', error);
        }
        
        // Отменяем таймаут, так как инициализация завершена успешно
        clearTimeout(initTimeout);
        
        // Скрываем loading screen
        setTimeout(() => {
            hideLoading();
            // Показываем приветственное уведомление (только первый раз)
            try {
                showWelcomeNotification();
            } catch (error) {
                console.warn('⚠️ Ошибка показа приветственного уведомления:', error);
            }
        }, 500);
        
        console.log('✅ Игра успешно инициализирована');
        console.log('📊 Текущее состояние:', gameState);
    } catch (error) {
        // Отменяем таймаут при ошибке
        clearTimeout(initTimeout);
        
        console.error('❌ Ошибка инициализации:', error);
        console.error('❌ Стек ошибки:', error.stack);
        hideLoading();
        
        // Показываем ошибку, но не блокируем игру полностью
        try {
            showError('Ошибка инициализации', error.message || 'Неизвестная ошибка. Пожалуйста, обновите страницу.');
        } catch (e) {
            console.error('❌ Ошибка показа ошибки:', e);
        }
        
        // Убеждаемся что игра все равно может работать
        try {
            updateUI();
        } catch (e) {
            console.error('❌ Ошибка обновления UI после ошибки:', e);
        }
    }
});

/* ============================================
   Loading State
   ============================================ */
function showLoading(text = 'Загрузка...') {
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingText = document.getElementById('loadingText');
    const appContainer = document.getElementById('appContainer');
    
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
    }
    
    if (loadingText) {
        loadingText.textContent = text;
    }
    
    if (appContainer) {
        appContainer.style.opacity = '0';
    }
}

function hideLoading() {
    console.log('🔄 Скрытие экрана загрузки...');
    const loadingScreen = document.getElementById('loadingScreen');
    const appContainer = document.getElementById('appContainer');
    
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        // Дополнительно скрываем через style для гарантии
        loadingScreen.style.display = 'none';
        console.log('✅ Экран загрузки скрыт');
    } else {
        console.warn('⚠️ Элемент loadingScreen не найден');
    }
    
    if (appContainer) {
        appContainer.style.opacity = '1';
        // app-container уже имеет display: flex в CSS, не нужно менять
        console.log('✅ Контейнер приложения показан');
    } else {
        console.warn('⚠️ Элемент appContainer не найден');
    }
}

function updateLoadingText(text) {
    const loadingText = document.getElementById('loadingText');
    if (loadingText) {
        loadingText.textContent = text;
    }
}

/* ============================================
   Обработка ошибок
   ============================================ */
function showError(title, message) {
    const errorOverlay = document.getElementById('errorOverlay');
    const errorTitle = document.getElementById('errorTitle');
    const errorMessage = document.getElementById('errorMessage');
    
    if (errorOverlay && errorTitle && errorMessage) {
        errorTitle.textContent = title;
        errorMessage.textContent = message;
        errorOverlay.style.display = 'flex';
    }
    
    console.error(`❌ ${title}: ${message}`);
    
    // Тактильная обратная связь
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('error');
    }
}

function hideError() {
    const errorOverlay = document.getElementById('errorOverlay');
    if (errorOverlay) {
        errorOverlay.style.display = 'none';
    }
}

// Обработка ошибок сети
function handleNetworkError() {
    if (!navigator.onLine) {
        showOfflineIndicator();
    } else {
        hideOfflineIndicator();
    }
}

// Установка детектора оффлайн режима
function setupOfflineDetection() {
    window.addEventListener('online', () => {
        hideOfflineIndicator();
        showNotification('🌐', 'Интернет восстановлен', 'success');
        // Синхронизация данных при восстановлении соединения
        if (window.FirebaseService && window.FirebaseService.isInitialized()) {
            syncGameStateToFirebase();
        }
    });
    
    window.addEventListener('offline', () => {
        showOfflineIndicator();
        showNotification('📴', 'Работа в оффлайн режиме', 'warning');
        gameState.offlineMode = true;
    });
    
    // Проверка текущего статуса
    if (!navigator.onLine) {
        gameState.offlineMode = true;
        showOfflineIndicator();
    }
}

function showOfflineIndicator() {
    let indicator = document.getElementById('offlineIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'offlineIndicator';
        indicator.className = 'offline-indicator';
        indicator.innerHTML = '<span class="offline-icon">📴</span><span>Оффлайн режим</span>';
        document.body.appendChild(indicator);
    }
    indicator.classList.add('show');
}

function hideOfflineIndicator() {
    const indicator = document.getElementById('offlineIndicator');
    if (indicator) {
        indicator.classList.remove('show');
    }
    gameState.offlineMode = false;
}

/* ============================================
   Система уведомлений
   ============================================ */
function showNotification(icon, title, text, type = 'info', duration = 3000) {
    const toast = document.getElementById('notificationToast');
    if (!toast) return;
    
    toast.className = `notification-toast ${type}`;
    toast.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-text">${text}</div>
        </div>
        <button class="notification-close" onclick="hideNotification()">×</button>
    `;
    
    toast.classList.add('show');
    
    // Автоматическое скрытие
    setTimeout(() => {
        hideNotification();
    }, duration);
    
    // Тактильная обратная связь
    if (tg && tg.HapticFeedback) {
        if (type === 'success') {
            tg.HapticFeedback.notificationOccurred('success');
        } else if (type === 'error') {
            tg.HapticFeedback.notificationOccurred('error');
        }
    }
}

function hideNotification() {
    const toast = document.getElementById('notificationToast');
    if (toast) {
        toast.classList.remove('show');
    }
}

window.hideNotification = hideNotification; // Глобальная функция для onclick

function showWelcomeNotification() {
    // Проверка версии для показа уведомлений о новых функциях
    const savedVersion = localStorage.getItem('appVersion');
    const currentVersion = appSettings.version || '1.0.0';
    
    if (!savedVersion || savedVersion !== currentVersion) {
        setTimeout(() => {
            showNotification('🎉', 'Добро пожаловать!', 'Новые функции доступны. Проверьте меню!', 'success', 5000);
            localStorage.setItem('appVersion', currentVersion);
        }, 1000);
    }
}

/* ============================================
   Инициализация Telegram Web App
   ============================================ */
function initTelegram() {
    console.log('📱 Инициализация Telegram Web App...');
    
    // Проверка наличия Telegram Web App SDK
    if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
        tg = window.Telegram.WebApp;
        
        // Инициализация WebApp
        tg.ready();
        tg.expand();
        
        console.log('✅ Telegram Web App SDK загружен');
        
        // Настройка темы
        tg.setHeaderColor('#2481cc');
        tg.setBackgroundColor('#ffffff');
        
        // Получение данных пользователя
        getUserDataFromTelegram();
        
        // Обработка реферального кода из URL удалена отсюда - вызывается отдельно в DOMContentLoaded
        
        // Настройка кнопки "Назад"
        tg.BackButton.onClick(() => {
            console.log('🔙 Нажата кнопка "Назад"');
            closeMenu();
        });
        
    } else {
        console.warn('⚠️ Telegram Web App SDK не найден. Работа в тестовом режиме.');
        // Для тестирования вне Telegram создаем тестового пользователя
        createTestUser();
    }
}

/* ============================================
   Получение данных пользователя из Telegram
   ============================================ */
function getUserDataFromTelegram() {
    console.log('👤 Получение данных пользователя из Telegram...');
    
    if (!tg || !tg.initDataUnsafe) {
        console.warn('⚠️ Данные Telegram недоступны');
        return;
    }
    
    const user = tg.initDataUnsafe.user;
    
    if (user) {
        // Сохранение данных пользователя
        gameState.userId = user.id;
        gameState.userName = user.first_name || 'Игрок';
        
        if (user.last_name) {
            gameState.userName += ' ' + user.last_name;
        }
        
        if (user.username) {
            gameState.userName = '@' + user.username;
        }
        
        // Аватар пользователя (если доступен)
        if (user.photo_url) {
            gameState.userAvatar = user.photo_url;
        }
        
        console.log('✅ Данные пользователя получены:', {
            id: gameState.userId,
            name: gameState.userName,
            hasAvatar: !!gameState.userAvatar
        });
        
        // Генерация реферального кода на основе ID пользователя
        if (!gameState.referralCode) {
            gameState.referralCode = generateReferralCode(gameState.userId);
            saveGameState();
        }
        
    } else {
        console.warn('⚠️ Пользователь не авторизован в Telegram');
        createTestUser();
    }
}

/* ============================================
   Создание тестового пользователя (для разработки)
   ============================================ */
function createTestUser() {
    console.log('🧪 Создание тестового пользователя...');
    
    // Используем сохраненный userId если есть
    const savedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (savedUserId && !gameState.userId) {
        try {
            gameState.userId = parseInt(savedUserId) || savedUserId;
        } catch (e) {
            gameState.userId = savedUserId;
        }
    }
    
    // Если userId все еще не установлен, создаем новый
    if (!gameState.userId) {
        gameState.userId = 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    }
    
    gameState.userName = 'Тестовый игрок';
    
    // Сохраняем userId в localStorage
    localStorage.setItem(STORAGE_KEYS.USER_ID, gameState.userId.toString());
    
    // Генерируем код только если его нет
    if (!gameState.referralCode) {
        gameState.referralCode = generateReferralCode(gameState.userId);
    }
    
    // Сохраняем состояние
    saveGameState();
    
    console.log('✅ Тестовый пользователь создан:', {
        id: gameState.userId,
        code: gameState.referralCode
    });
}

/* ============================================
   Генерация уникального реферального кода
   ============================================ */
function generateReferralCode(userId) {
    if (!userId) {
        userId = Date.now() + Math.random().toString(36).substring(7);
    }
    
    // Улучшенная генерация: комбинация userId, timestamp и случайной строки
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    const combined = `${userId}_${timestamp}_${randomStr}`;
    
    // Кодирование в base64 и очистка от спецсимволов
    let code = btoa(combined)
        .replace(/[+/=]/g, '')
        .substring(0, 12)
        .toUpperCase();
    
    // Добавляем префикс для лучшей читаемости
    code = 'TAP' + code;
    
    console.log('🔗 Сгенерирован реферальный код:', code);
    
    return code;
}

/* ============================================
   Валидация реферального кода
   ============================================ */
function validateReferralCode(code) {
    if (!code || typeof code !== 'string') {
        return { valid: false, error: 'Код не может быть пустым' };
    }
    
    // Проверка формата: должен начинаться с TAP и содержать только буквы/цифры
    if (!/^TAP[A-Z0-9]{8,12}$/.test(code)) {
        return { valid: false, error: 'Неверный формат кода' };
    }
    
    // Проверка на собственный код
    if (code === gameState.referralCode) {
        return { valid: false, error: 'Нельзя использовать собственный код' };
    }
    
    // Проверка длины
    if (code.length < 11 || code.length > 15) {
        return { valid: false, error: 'Неверная длина кода' };
    }
    
    return { valid: true };
}

/* ============================================
   Обеспечение наличия реферального кода
   ============================================ */
async function ensureReferralCode() {
    console.log('🔍 Проверка реферального кода пользователя...');
    
    try {
        // Убеждаемся что userId установлен
        if (!gameState.userId) {
            console.warn('⚠️ userId не установлен в ensureReferralCode, создаем тестового пользователя');
            createTestUser();
        }
        
        // Если код уже есть, проверяем его валидность
        if (gameState.referralCode && typeof gameState.referralCode === 'string') {
            const validation = validateReferralCode(gameState.referralCode);
            if (!validation.valid && gameState.referralCode.startsWith && !gameState.referralCode.startsWith('TAP')) {
                console.log('⚠️ Старый формат кода, генерируем новый');
                gameState.referralCode = null;
            } else if (validation.valid) {
                console.log('✅ Реферальный код уже существует:', gameState.referralCode);
                return;
            }
        }
        
        // Генерация нового кода
        if (gameState.userId) {
            gameState.referralCode = generateReferralCode(gameState.userId);
        } else {
            const tempUserId = Date.now();
            gameState.referralCode = generateReferralCode(tempUserId);
        }
        
        // Сохранение кода в Firebase (если доступен)
        if (window.FirebaseService && window.FirebaseService.isInitialized()) {
            try {
                await window.FirebaseService.saveReferralCode(
                    gameState.userId || Date.now(),
                    gameState.referralCode
                );
            } catch (error) {
                console.warn('⚠️ Не удалось сохранить код в Firebase:', error);
            }
        }
        
        // Сохранение в localStorage
        saveGameState();
        
        // Синхронизация с Firebase
        if (window.FirebaseService && window.FirebaseService.isInitialized() && gameState.userId) {
            try {
                syncGameStateToFirebase();
            } catch (error) {
                console.warn('⚠️ Ошибка синхронизации с Firebase:', error);
            }
        }
        
        console.log('✅ Реферальный код создан и сохранен:', gameState.referralCode);
    } catch (error) {
        console.error('❌ Ошибка в ensureReferralCode:', error);
        // Создаем код в любом случае
        if (!gameState.referralCode) {
            const tempUserId = gameState.userId || Date.now();
            gameState.referralCode = generateReferralCode(tempUserId);
            saveGameState();
        }
        throw error;
    }
}

/* ============================================
   Синхронизация состояния игры с Firebase
   ============================================ */
async function syncGameStateToFirebase() {
    if (!window.FirebaseService || !window.FirebaseService.isInitialized() || !gameState.userId || appSettings.offlineMode) {
        return;
    }
    
    try {
        const userData = {
            userId: gameState.userId.toString(),
            userName: gameState.userName,
            coins: gameState.coins,
            totalTaps: gameState.totalTaps,
            coinsPerClick: gameState.coinsPerClick,
            clicksPerSecond: gameState.clicksPerSecond,
            referralCode: gameState.referralCode,
            referredBy: gameState.referredBy,
            referralsCount: gameState.referralsCount,
            referralBonus: gameState.referralBonus,
            purchasedUpgrades: gameState.purchasedUpgrades || [],
            achievements: achievementsState.achievements || [],
            lastBonusDate: dailyBonusState.lastBonusDate,
            bonusStreak: dailyBonusState.bonusStreak,
            version: appSettings.version
        };
        
        const result = await window.FirebaseService.saveUserProgress(gameState.userId, userData);
        
        if (result && result.success) {
            console.log('✅ Состояние синхронизировано с Firebase');
            appSettings.lastSyncTime = Date.now();
        } else {
            throw new Error(result?.error || 'Неизвестная ошибка');
        }
    } catch (error) {
        console.error('❌ Ошибка синхронизации с Firebase:', error);
        
        // Если ошибка сети, переключаемся в оффлайн режим
        if (error.message.includes('network') || error.message.includes('fetch')) {
            appSettings.offlineMode = true;
            showOfflineIndicator();
        }
        
        throw error;
    }
}

/* ============================================
   Генерация реферальной ссылки
   ============================================ */
function generateReferralLink() {
    console.log('🔗 Генерация реферальной ссылки...');
    
    if (!gameState.referralCode) {
        if (gameState.userId) {
            gameState.referralCode = generateReferralCode(gameState.userId);
        } else {
            const tempUserId = Date.now();
            gameState.referralCode = generateReferralCode(tempUserId);
        }
    }
    
    const baseUrl = window.location.origin + window.location.pathname;
    const referralLink = `${baseUrl}?ref=${gameState.referralCode}`;
    
    // Обновление поля ввода
    const referralInput = document.getElementById('referralLink');
    if (referralInput) {
        referralInput.value = referralLink;
        console.log('✅ Реферальная ссылка обновлена:', referralLink);
    }
    
    return referralLink;
}

/* ============================================
   Проверка и обработка реферального кода из URL
   ============================================ */
async function checkReferralFromURL() {
    console.log('🔍 Проверка реферального кода из URL...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (!refCode) {
        console.log('ℹ️ Реферальный код в URL не найден');
        return;
    }
    
    console.log('📥 Найден реферальный код в URL:', refCode);
    
    // Валидация кода
    const validation = validateReferralCode(refCode);
    if (!validation.valid) {
        console.warn('⚠️ Реферальный код невалиден:', validation.error);
        if (tg && tg.showAlert) {
            tg.showAlert(`Неверный реферальный код: ${validation.error}`);
        }
        return;
    }
    
    // Проверяем, что пользователь еще не был приглашен
    if (gameState.referredBy) {
        console.log('ℹ️ Пользователь уже был приглашен ранее:', gameState.referredBy);
        return;
    }
    
    // Проверяем, что это не собственный код
    if (refCode === gameState.referralCode) {
        console.log('ℹ️ Это собственный реферальный код');
        return;
    }
    
    // Сохраняем информацию о реферере локально
    gameState.referredBy = refCode;
    gameState.isNewUser = true; // Флаг для начисления бонуса при первом тапе
    gameState.referralProcessed = false;
    
    console.log('✅ Реферальный код сохранен локально:', refCode);
    saveGameState();
    
    // Попытка зарегистрировать реферала в Firebase (если доступен)
    if (window.FirebaseService && window.FirebaseService.isInitialized() && gameState.userId) {
        try {
            const result = await window.FirebaseService.registerReferral(
                refCode,
                gameState.userId,
                {
                    userName: gameState.userName,
                    coins: gameState.coins,
                    totalTaps: gameState.totalTaps
                }
            );
            
            if (result.success) {
                gameState.referredByUserId = result.referrerUserId;
                console.log('✅ Реферал зарегистрирован в Firebase');
                saveGameState();
                
                // Показываем уведомление
                if (tg && tg.showAlert) {
                    tg.showAlert('Вы присоединились по реферальной ссылке! Бонус будет начислен при первом тапе.');
                }
            } else {
                console.warn('⚠️ Не удалось зарегистрировать реферала:', result.error);
            }
        } catch (error) {
            console.error('❌ Ошибка регистрации реферала в Firebase:', error);
        }
    } else {
        console.log('ℹ️ Firebase недоступен, реферал будет обработан при первом тапе');
    }
}

/* ============================================
   Обработка тапа
   ============================================ */
async function handleTap(event) {
    if (event) {
        event.preventDefault();
    }
    
    console.log('👆 Тап зарегистрирован');
    
    // Обработка реферального бонуса при первом тапе нового пользователя
    if (gameState.isNewUser && gameState.referredBy && !gameState.referralProcessed) {
        await processReferralBonus();
    }
    
    // Расчет монет за тап (учитывает улучшения и бонусы)
    const coinsEarned = calculateCoinsPerTap();
    
    // Обновляем локальное состояние
    gameState.coins += coinsEarned;
    gameState.totalTaps++;
    
    // Снимаем флаг нового пользователя после первого тапа
    if (gameState.isNewUser) {
        gameState.isNewUser = false;
    }
    
    console.log(`💰 Получено монет: ${coinsEarned}, Всего: ${gameState.coins}`);
    console.log(`📊 Всего тапов: ${gameState.totalTaps}`);
    
    // Обновляем UI
    updateUI();
    
    // Визуальная обратная связь
    if (event) {
        showTapFeedback(event, coinsEarned);
        
        // Тактильная обратная связь (вибрация в Telegram)
        if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
    }
    
    // Сохраняем в Firebase
    const userId = window.userId || gameState.userId;
    if (userId && !userId.toString().startsWith('local_')) {
        try {
            await updateCoins(userId, coinsEarned);
        } catch (error) {
            console.error('❌ Ошибка обновления монет в Firebase:', error);
        }
    }
    
    // Резервное сохранение в localStorage
    try {
        const stateToSave = {
            coins: gameState.coins,
            totalTaps: gameState.totalTaps,
            coinsPerClick: gameState.coinsPerClick,
            clicksPerSecond: gameState.clicksPerSecond,
            referralsCount: gameState.referralsCount,
            referralBonus: gameState.referralBonus,
            referredBy: gameState.referredBy,
            purchasedUpgrades: gameState.purchasedUpgrades || [],
            timestamp: Date.now()
        };
        localStorage.setItem('tapGameState', JSON.stringify(stateToSave));
    } catch (error) {
        console.error('❌ Ошибка сохранения в localStorage:', error);
    }
    
    // Проверка достижений после тапа
    checkAchievements();
    
    // Автосохранение (с задержкой для оптимизации)
    debounceSave();
}

/* ============================================
   Обработка реферального бонуса при первом тапе
   ============================================ */
async function processReferralBonus() {
    if (gameState.referralProcessed) {
        return;
    }
    
    console.log('🎁 Обработка реферального бонуса...');
    
    // Регистрация реферала в Firebase (если еще не зарегистрирован)
    if (window.FirebaseService && window.FirebaseService.isInitialized() && gameState.userId && gameState.referredBy) {
        try {
            const result = await window.FirebaseService.registerReferral(
                gameState.referredBy,
                gameState.userId,
                {
                    userName: gameState.userName,
                    coins: gameState.coins,
                    totalTaps: gameState.totalTaps
                }
            );
            
            if (result.success) {
                gameState.referredByUserId = result.referrerUserId;
                gameState.referralProcessed = true;
                
                console.log('✅ Реферал успешно зарегистрирован, бонус начислен рефереру');
                
                // Показываем уведомление
                if (tg && tg.showAlert) {
                    tg.showAlert('🎉 Вы присоединились по реферальной ссылке! Ваш реферер получил бонус.');
                }
                
                // Обновляем статистику реферера
                if (result.referrerUserId) {
                    await updateReferrerStats(result.referrerUserId);
                }
            } catch (error) {
            console.error('❌ Ошибка обработки реферального бонуса:', error);
        }
    }
    
    // Сохранение состояния
    saveGameState();
}

/* ============================================
   Обновление статистики реферера
   ============================================ */
async function updateReferrerStats(referrerUserId) {
    if (!window.FirebaseService || !window.FirebaseService.isInitialized()) {
        return;
    }
    
    try {
        // Обновляем статистику, если это наш пользователь
        if (referrerUserId && referrerUserId.toString() === gameState.userId?.toString()) {
            const stats = await window.FirebaseService.getReferralStats(gameState.userId);
            if (stats) {
                gameState.referralsCount = stats.referralsCount || gameState.referralsCount;
                gameState.referralBonus = stats.referralBonus || gameState.referralBonus;
                gameState.referrals = stats.referrals || gameState.referrals || [];
                updateUI();
                renderReferralHistory();
            }
        }
    } catch (error) {
        console.error('❌ Ошибка обновления статистики реферера:', error);
    }
}

/* ============================================
   Расчет монет за один тап
   ============================================ */
function calculateCoinsPerTap() {
    let coins = gameState.coinsPerClick;
    
    // Добавляем бонусы от улучшений
    gameState.purchasedUpgrades.forEach(upgradeId => {
        const upgrade = upgrades.find(u => u.id === upgradeId);
        if (upgrade && upgrade.perClickIncrease) {
            coins += upgrade.perClickIncrease;
        }
    });
    
    // Бонус от рефералов (каждый реферал дает +1% к доходу)
    const referralMultiplier = 1 + (gameState.referralBonus / 100);
    coins = Math.floor(coins * referralMultiplier);
    
    return coins;
}

/* ============================================
   Инициализация системы улучшений
   ============================================ */
function initUpgrades() {
    console.log('🔧 Инициализация системы улучшений...');
    
    // Останавливаем все предыдущие автокликеры
    stopAllAutoClickers();
    
    // Запускаем активные автокликеры из купленных улучшений
    gameState.purchasedUpgrades.forEach(upgradeId => {
        const upgrade = upgrades.find(u => u.id === upgradeId);
        if (upgrade && upgrade.autoClicker) {
            startAutoClicker(upgrade);
        }
    });
    
    // Рендерим улучшения
    renderUpgrades();
    
    console.log('✅ Система улучшений инициализирована');
}

/* ============================================
   Рендер улучшений
   ============================================ */
function renderUpgrades() {
    const upgradesContainer = document.getElementById('upgradesContainer');
    if (!upgradesContainer) {
        console.warn('⚠️ Контейнер улучшений не найден');
        return;
    }
    
    console.log('🎨 Рендеринг улучшений...');
    
    if (upgrades.length === 0) {
        upgradesContainer.innerHTML = '<p class="upgrades-placeholder">Улучшения будут добавлены позже</p>';
        return;
    }
    
    upgradesContainer.innerHTML = upgrades.map(upgrade => {
        const isPurchased = gameState.purchasedUpgrades.includes(upgrade.id);
        const canAfford = gameState.coins >= upgrade.cost;
        const canPurchase = canAfford && !isPurchased && canPurchaseUpgrade(upgrade);
        
        return `
            <div class="upgrade-card ${isPurchased ? 'purchased' : ''} ${canPurchase ? 'affordable' : ''} ${!canPurchase && !isPurchased ? 'locked' : ''}" 
                 data-upgrade-id="${upgrade.id}">
                <div class="upgrade-header">
                    <span class="upgrade-icon">${upgrade.icon || '⚙️'}</span>
                    <div class="upgrade-title-wrapper">
                        <h3 class="upgrade-name">${upgrade.name}</h3>
                        ${isPurchased ? '<span class="purchased-badge">✓ Куплено</span>' : ''}
                    </div>
                </div>
                <p class="upgrade-description">${upgrade.description}</p>
                <div class="upgrade-footer">
                    <div class="upgrade-cost">
                        <span class="cost-label">Цена:</span>
                        <span class="cost-value ${canAfford ? '' : 'insufficient'}">${formatNumber(upgrade.cost)} 🪙</span>
                    </div>
                    ${!isPurchased ? `
                        <button class="buy-upgrade-btn ${canPurchase ? '' : 'disabled'}" 
                                ${canPurchase ? '' : 'disabled'}
                                onclick="buyUpgrade(${upgrade.id})">
                            ${canAfford ? 'Купить' : 'Недостаточно'}
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    console.log(`✅ Отображено ${upgrades.length} улучшений`);
}

/* ============================================
   Проверка возможности покупки улучшения
   ============================================ */
function canPurchaseUpgrade(upgrade) {
    // Проверка требований (требуемые улучшения должны быть куплены)
    if (upgrade.requires && Array.isArray(upgrade.requires)) {
        return upgrade.requires.every(requiredId => 
            gameState.purchasedUpgrades.includes(requiredId)
        );
    }
    return true;
}

/* ============================================
   Покупка улучшения (глобальная функция для onclick)
   ============================================ */
window.buyUpgrade = function(upgradeId) {
    console.log(`💰 Покупка улучшения ID: ${upgradeId}`);
    
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade) {
        console.error('❌ Улучшение не найдено:', upgradeId);
        return;
    }
    
    // Проверки
    if (gameState.purchasedUpgrades.includes(upgradeId)) {
        console.warn('⚠️ Улучшение уже куплено');
        if (tg && tg.showAlert) {
            tg.showAlert('Это улучшение уже куплено!');
        }
        return;
    }
    
    if (gameState.coins < upgrade.cost) {
        console.warn('⚠️ Недостаточно монет для покупки');
        if (tg && tg.showAlert) {
            tg.showAlert(`Недостаточно монет! Нужно ${upgrade.cost} 🪙`);
        }
        return;
    }
    
    if (!canPurchaseUpgrade(upgrade)) {
        console.warn('⚠️ Требования для покупки не выполнены');
        if (tg && tg.showAlert) {
            const requiredNames = upgrade.requires
                .map(id => upgrades.find(u => u.id === id)?.name)
                .filter(Boolean)
                .join(', ');
            tg.showAlert(`Сначала нужно купить: ${requiredNames}`);
        }
        return;
    }
    
    // Покупка
    gameState.coins -= upgrade.cost;
    gameState.purchasedUpgrades.push(upgradeId);
    
    console.log(`✅ Улучшение "${upgrade.name}" куплено за ${upgrade.cost} монет`);
    
    // Применение эффекта улучшения
    applyUpgradeEffect(upgrade);
    
    // Обновление UI
    updateUI();
    renderUpgrades();
    
    // Тактильная обратная связь
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
        tg.HapticFeedback.notificationOccurred('success');
    }
    
    // Показ уведомления
    if (tg && tg.showAlert) {
        tg.showAlert(`🎉 Улучшение "${upgrade.name}" куплено!`);
    }
    
    // Сохранение
    saveGameState();
};

/* ============================================
   Применение эффекта улучшения
   ============================================ */
function applyUpgradeEffect(upgrade) {
    if (upgrade.autoClicker) {
        // Запускаем автокликер
        startAutoClicker(upgrade);
        console.log(`🤖 Автокликер "${upgrade.name}" активирован`);
    }
    
    if (upgrade.perClickIncrease) {
        // Улучшение уже учитывается в calculateCoinsPerTap()
        console.log(`⚡ Бонус за клик увеличен на ${upgrade.perClickIncrease}`);
    }
    
    // Обновляем отображение монет за клик
    updateStats();
}

/* ============================================
   Запуск автокликера
   ============================================ */
function startAutoClicker(upgrade) {
    if (!upgrade.autoClicker || !upgrade.autoClickAmount || !upgrade.autoClickInterval) {
        return;
    }
    
    console.log(`🚀 Запуск автокликера: ${upgrade.name}`);
    
    const intervalId = setInterval(() => {
        const coinsEarned = upgrade.autoClickAmount;
        gameState.coins += coinsEarned;
        
        console.log(`💰 Автокликер "${upgrade.name}": +${coinsEarned} монет`);
        
        // Обновляем UI
        updateCoinsDisplay();
        
        // Сохранение (с debounce)
        debounceSave();
        
        // Визуальная обратная связь (опционально)
        showAutoClickFeedback(coinsEarned);
        
    }, upgrade.autoClickInterval);
    
    // Сохраняем ID интервала для возможности остановки
    autoClickerIntervals.push({
        upgradeId: upgrade.id,
        intervalId: intervalId
    });
    
    // Обновляем статистику кликов в секунду
    updateClicksPerSecond();
    
    // Обновляем отображение CPS в UI
    const cpsDisplay = document.getElementById('clicksPerSecondDisplay');
    if (cpsDisplay) {
        cpsDisplay.textContent = gameState.clicksPerSecond || 0;
    }
}

/* ============================================
   Остановка всех автокликеров
   ============================================ */
function stopAllAutoClickers() {
    console.log('🛑 Остановка всех автокликеров...');
    
    autoClickerIntervals.forEach(({ intervalId }) => {
        clearInterval(intervalId);
    });
    
    autoClickerIntervals = [];
    console.log('✅ Все автокликеры остановлены');
}

/* ============================================
   Визуальная обратная связь автокликера
   ============================================ */
function showAutoClickFeedback(coins) {
    // Создаем временный элемент для показа автоклика
    const feedback = document.createElement('div');
    feedback.className = 'auto-click-feedback';
    feedback.textContent = `+${coins}`;
    feedback.style.cssText = `
        position: fixed;
        top: 20%;
        right: 20px;
        background: rgba(107, 207, 127, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 0.875rem;
        z-index: 10000;
        animation: slideInRight 0.5s ease-out forwards;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.style.animation = 'slideOutRight 0.5s ease-in forwards';
        setTimeout(() => {
            document.body.removeChild(feedback);
        }, 500);
    }, 2000);
}

/* ============================================
   Обновление статистики кликов в секунду
   ============================================ */
function updateClicksPerSecond() {
    let totalCPS = 0;
    
    gameState.purchasedUpgrades.forEach(upgradeId => {
        const upgrade = upgrades.find(u => u.id === upgradeId);
        if (upgrade && upgrade.autoClicker && upgrade.autoClickAmount && upgrade.autoClickInterval) {
            // Рассчитываем CPS: количество монет за интервал / интервал в секундах
            const cps = upgrade.autoClickAmount / (upgrade.autoClickInterval / 1000);
            totalCPS += cps;
        }
    });
    
    gameState.clicksPerSecond = Math.round(totalCPS);
}

/* ============================================
   Визуальная обратная связь при тапе
   ============================================ */
function showTapFeedback(event, coins) {
    const tapCounter = document.getElementById('tapCounter');
    
    if (tapCounter) {
        // Установка позиции счетчика
        if (event && event.clientX && event.clientY) {
            tapCounter.style.left = event.clientX + 'px';
            tapCounter.style.top = (event.clientY - 50) + 'px';
        } else {
            // Центрирование, если координаты недоступны
            const tapButton = document.getElementById('tapButton');
            if (tapButton) {
                const rect = tapButton.getBoundingClientRect();
                tapCounter.style.left = (rect.left + rect.width / 2) + 'px';
                tapCounter.style.top = (rect.top - 30) + 'px';
            }
        }
        
        // Обновление текста
        tapCounter.textContent = `+${coins}`;
        tapCounter.style.opacity = '1';
        
        // Анимация
        tapCounter.classList.remove('tap-animate');
        void tapCounter.offsetWidth; // Принудительный reflow
        tapCounter.classList.add('tap-animate');
        
        // Сброс через время анимации
        setTimeout(() => {
            tapCounter.style.opacity = '0';
        }, 500);
    }
}

/* ============================================
   Обновление интерфейса
   ============================================ */
function updateUI() {
    console.log('🔄 Обновление интерфейса...');
    
    // Обновление счетчика монет
    updateCoinsDisplay();
    
    // Обновление информации о пользователе
    updateUserInfo();
    
    // Обновление статистики
    updateStats();
    
    // Обновление реферальной информации
    updateReferralInfo();
    
    // Обновление доступности улучшений
    updateUpgradesAvailability();
}

/* ============================================
   Обновление счетчика монет
   ============================================ */
function updateCoinsDisplay() {
    const coinsDisplay = document.getElementById('coinsDisplay');
    if (coinsDisplay) {
        coinsDisplay.textContent = formatNumber(gameState.coins);
        console.log(`💰 Монеты обновлены: ${gameState.coins}`);
    }
}

/* ============================================
   Обновление информации о пользователе
   ============================================ */
function updateUserInfo() {
    const userName = document.getElementById('userName');
    const userId = document.getElementById('userId');
    const userAvatar = document.getElementById('userAvatar');
    const avatarIcon = document.getElementById('avatarIcon');
    
    if (userName) {
        userName.textContent = gameState.userName;
    }
    
    if (userId) {
        userId.textContent = `ID: ${gameState.userId || '---'}`;
    }
    
    if (userAvatar && gameState.userAvatar) {
        userAvatar.style.backgroundImage = `url(${gameState.userAvatar})`;
        userAvatar.style.backgroundSize = 'cover';
        userAvatar.style.backgroundPosition = 'center';
        if (avatarIcon) {
            avatarIcon.style.display = 'none';
        }
    }
}

/* ============================================
   Обновление статистики
   ============================================ */
function updateStats() {
    const totalTapsDisplay = document.getElementById('totalTapsDisplay');
    const coinsPerClickDisplay = document.getElementById('coinsPerClickDisplay');
    const clicksPerSecondDisplay = document.getElementById('clicksPerSecondDisplay');
    
    if (totalTapsDisplay) {
        totalTapsDisplay.textContent = formatNumber(gameState.totalTaps);
    }
    
    if (coinsPerClickDisplay) {
        coinsPerClickDisplay.textContent = gameState.coinsPerClick;
    }
    
    if (clicksPerSecondDisplay) {
        // Обновляем CPS перед отображением
        updateClicksPerSecond();
        clicksPerSecondDisplay.textContent = gameState.clicksPerSecond || 0;
    }
}

/* ============================================
   Инициализация Firebase (если доступен)
   ============================================ */
async function initFirebaseIfAvailable() {
    if (window.FirebaseService) {
        try {
            const result = await window.FirebaseService.init();
            const isInitialized = window.FirebaseService.isInitialized();
            
            if (isInitialized && result) {
                console.log('✅ Firebase инициализирован');
                appSettings.offlineMode = false;
            } else {
                // Firebase не инициализирован, но это не критично
                console.warn('⚠️ Firebase не удалось инициализировать, работаем в оффлайн режиме');
                appSettings.offlineMode = true;
            }
        } catch (error) {
            console.warn('⚠️ Firebase недоступен, работаем только с localStorage:', error);
            appSettings.offlineMode = true;
            
            // НЕ показываем уведомление, чтобы не блокировать инициализацию
            // Уведомление может помешать при первом запуске
        }
    } else {
        console.log('ℹ️ Firebase Service не загружен, работаем только с localStorage');
        appSettings.offlineMode = true;
    }
}

/* ============================================
   FIREBASE ФУНКЦИИ
   ============================================ */

// Сохранение данных пользователя
async function saveUserData(userId, data) {
    try {
        if (!window.firebaseDb || !window.FirebaseService || !window.FirebaseService.isInitialized()) {
            console.warn('⚠️ Firebase не инициализирован, сохранение в localStorage');
            localStorage.setItem(`user_${userId}`, JSON.stringify(data));
            return;
        }

        // Используем Firebase v9+ модули
        const { doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const userRef = doc(window.firebaseDb, 'users', userId.toString());
        
        await setDoc(userRef, {
            ...data,
            lastUpdated: serverTimestamp()
        }, { merge: true });
        
        console.log('✅ Данные сохранены в Firebase');
    } catch (error) {
        console.error('❌ Ошибка сохранения:', error);
        // Резервное сохранение в localStorage
        localStorage.setItem(`user_${userId}`, JSON.stringify(data));
    }
}

// Загрузка данных пользователя
async function loadUserData(userId) {
    try {
        if (!window.firebaseDb || !window.FirebaseService || !window.FirebaseService.isInitialized()) {
            console.warn('⚠️ Firebase не инициализирован, загрузка из localStorage');
            const localData = localStorage.getItem(`user_${userId}`);
            return localData ? JSON.parse(localData) : null;
        }

        // Используем Firebase v9+ модули
        const { doc, getDoc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const userRef = doc(window.firebaseDb, 'users', userId.toString());
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            console.log('✅ Данные загружены из Firebase');
            return userSnap.data();
        } else {
            // Создаём нового пользователя
            const newUser = {
                coins: 0,
                taps: 0,
                perClick: 1,
                referrals: [],
                referralsCount: 0,
                createdAt: serverTimestamp()
            };
            await setDoc(userRef, newUser, { merge: true });
            return newUser;
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        // Загружаем из localStorage
        const localData = localStorage.getItem(`user_${userId}`);
        return localData ? JSON.parse(localData) : null;
    }
}

// Обновление монет
async function updateCoins(userId, coinsToAdd) {
    try {
        if (!window.firebaseDb || !window.FirebaseService || !window.FirebaseService.isInitialized()) {
            console.warn('⚠️ Firebase не инициализирован');
            return;
        }

        // Используем Firebase v9+ модули
        const { doc, updateDoc, increment, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const userRef = doc(window.firebaseDb, 'users', userId.toString());
        
        await updateDoc(userRef, {
            coins: increment(coinsToAdd),
            taps: increment(1),
            lastTap: serverTimestamp()
        });
        
        console.log('✅ Монеты обновлены');
    } catch (error) {
        console.error('❌ Ошибка обновления монет:', error);
    }
}

// Реферальная система
async function handleReferral(referrerId, referredId) {
    try {
        if (!window.firebaseDb || !window.FirebaseService || !window.FirebaseService.isInitialized()) {
            console.warn('⚠️ Firebase не инициализирован');
            return;
        }

        // Используем Firebase v9+ модули
        const { doc, updateDoc, increment, arrayUnion, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        const referrerRef = doc(window.firebaseDb, 'users', referrerId.toString());
        
        // Добавляем реферала в массив и увеличиваем счётчик
        await updateDoc(referrerRef, {
            referrals: arrayUnion(referredId.toString()),
            referralsCount: increment(1),
            coins: increment(50), // Бонус за реферала
            lastUpdated: serverTimestamp()
        });
        
        console.log(`✅ Реферал ${referredId} добавлен к ${referrerId}`);
        
        // Также даём бонус новому пользователю
        const referredRef = doc(window.firebaseDb, 'users', referredId.toString());
        await updateDoc(referredRef, {
            coins: increment(25),
            lastUpdated: serverTimestamp()
        });
        
    } catch (error) {
        console.error('❌ Ошибка реферальной системы:', error);
    }
}

// Функция проверки рефералов
async function checkReferral(userId) {
    try {
        // Проверяем URL параметры
        const urlParams = new URLSearchParams(window.location.search);
        const refParam = urlParams.get('ref') || urlParams.get('startapp');
        
        if (refParam && refParam.startsWith('ref_')) {
            const referrerId = refParam.replace('ref_', '');
            
            // Проверяем, чтобы пользователь не пригласил сам себя
            if (referrerId !== userId.toString()) {
                // Проверяем, первый ли раз пользователь
                if (!window.firebaseDb || !window.FirebaseService || !window.FirebaseService.isInitialized()) {
                    console.warn('⚠️ Firebase не инициализирован, пропускаем проверку рефералов');
                    return;
                }
                
                // Используем Firebase v9+ модули
                const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                const userRef = doc(window.firebaseDb, 'users', userId.toString());
                const userDoc = await getDoc(userRef);
                
                if (!userDoc.exists()) {
                    // Новый пользователь - начисляем бонус рефереру
                    await handleReferral(referrerId, userId);
                    
                    // Показываем сообщение
                    if (tg && tg.showAlert) {
                        tg.showAlert('🎉 Вы получили 25 монет за переход по реферальной ссылке!');
                    } else {
                        alert('🎉 Вы получили 25 монет за переход по реферальной ссылке!');
                    }
                    
                    console.log('✅ Реферальная проверка завершена, бонус начислен');
                } else {
                    console.log('ℹ️ Пользователь уже существует, реферальный бонус не начислен');
                }
            } else {
                console.log('ℹ️ Пользователь пытается использовать собственную реферальную ссылку');
            }
        } else {
            console.log('ℹ️ Реферальный параметр не найден или неверный формат');
        }
    } catch (error) {
        console.error('❌ Ошибка проверки рефералов:', error);
    }
}

/* ============================================
   Обновлённая функция инициализации
   ============================================ */
async function initApp() {
    console.log('🚀 Инициализация приложения...');
    
    // Получаем userId
    let userId;
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
        // В Telegram
        const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
        userId = tgUser.id;
        gameState.userId = userId;
        gameState.userName = tgUser.first_name || 'Игрок';
        
        if (tgUser.last_name) {
            gameState.userName += ' ' + tgUser.last_name;
        }
        
        if (tgUser.username) {
            gameState.userName = '@' + tgUser.username;
        }
        
        // Обновляем имя пользователя в UI
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = `👤 ${gameState.userName}`;
        }
        
        // Проверяем реферальную ссылку
        await checkReferralFromURL();
    } else {
        // Локальный режим
        userId = 'local_' + Math.random().toString(36).substring(2, 11);
        gameState.userId = userId;
        gameState.userName = 'Тестовый режим';
        
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = '👤 Тестовый режим';
        }
    }
    
    // Сохраняем userId глобально для совместимости
    window.userId = userId;
    
    // Загружаем данные пользователя
    const userData = await loadUserData(userId);
    if (userData) {
        gameState.coins = userData.coins || gameState.coins || 0;
        gameState.totalTaps = userData.taps || userData.totalTaps || gameState.totalTaps || 0;
        gameState.coinsPerClick = userData.perClick || userData.coinsPerClick || gameState.coinsPerClick || 1;
        gameState.referralsCount = userData.referralsCount || gameState.referralsCount || 0;
        
        // Загружаем дополнительные данные, если они есть
        if (userData.referrals && Array.isArray(userData.referrals)) {
            gameState.referrals = userData.referrals;
        }
        if (userData.referralBonus !== undefined) {
            gameState.referralBonus = userData.referralBonus;
        }
        if (userData.purchasedUpgrades && Array.isArray(userData.purchasedUpgrades)) {
            gameState.purchasedUpgrades = userData.purchasedUpgrades;
        }
    }
    
    // Обновляем UI
    updateUI();
    
    console.log('✅ Приложение инициализировано, userId:', userId);
    return userId;
}

/* ============================================
   Загрузка данных из Firebase
   ============================================ */
async function loadDataFromFirebase() {
    if (!window.FirebaseService || !window.FirebaseService.isInitialized() || !gameState.userId) {
        return;
    }
    
    try {
        console.log('📥 Загрузка данных из Firebase...');
        
        // Загрузка данных пользователя
        const userData = await window.FirebaseService.getUserData(gameState.userId);
        if (userData) {
            // Обновляем только если данные из Firebase новее или отсутствуют локально
            if (!gameState.referralCode || userData.referralCode) {
                gameState.referralCode = userData.referralCode || gameState.referralCode;
            }
            if (!gameState.referredBy && userData.referredBy) {
                gameState.referredBy = userData.referredBy;
                gameState.referredByUserId = userData.referrerUserId;
            }
            
            // Синхронизация статистики (берем максимум)
            gameState.referralsCount = Math.max(
                gameState.referralsCount || 0,
                userData.referralsCount || 0
            );
            gameState.referralBonus = Math.max(
                gameState.referralBonus || 0,
                userData.referralBonus || 0
            );
            
            // Загрузка купленных улучшений (объединяем массивы, убираем дубликаты)
            if (userData.purchasedUpgrades && Array.isArray(userData.purchasedUpgrades)) {
                const merged = [...new Set([...gameState.purchasedUpgrades, ...userData.purchasedUpgrades])];
                gameState.purchasedUpgrades = merged;
            }
            
            console.log('✅ Данные из Firebase загружены');
        }
        
        // Загрузка статистики рефералов
        const referralStats = await window.FirebaseService.getReferralStats(gameState.userId);
        if (referralStats) {
            gameState.referralsCount = referralStats.referralsCount || gameState.referralsCount;
            gameState.referralBonus = referralStats.referralBonus || gameState.referralBonus;
            gameState.referrals = referralStats.referrals || gameState.referrals || [];
        }
        
    } catch (error) {
        console.error('❌ Ошибка загрузки данных из Firebase:', error);
    }
}

/* ============================================
   Загрузка истории рефералов
   ============================================ */
async function loadReferralHistory() {
    if (!window.FirebaseService || !window.FirebaseService.isInitialized() || !gameState.userId) {
        return;
    }
    
    try {
        console.log('📋 Загрузка истории рефералов...');
        
        const stats = await window.FirebaseService.getReferralStats(gameState.userId);
        if (stats && stats.referrals && Array.isArray(stats.referrals)) {
            gameState.referrals = stats.referrals;
            
            // Обновляем UI с историей рефералов
            renderReferralHistory();
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки истории рефералов:', error);
    }
}

/* ============================================
   Рендер истории рефералов
   ============================================ */
function renderReferralHistory() {
    const historyContainer = document.getElementById('referralHistory');
    if (!historyContainer) {
        return;
    }
    
    if (!gameState.referrals || gameState.referrals.length === 0) {
        historyContainer.innerHTML = '<p class="no-referrals">Пока нет приглашенных друзей</p>';
        return;
    }
    
    historyContainer.innerHTML = gameState.referrals.map((refId, index) => `
        <div class="referral-item">
            <span class="referral-number">${index + 1}</span>
            <span class="referral-id">ID: ${refId}</span>
            <span class="referral-status">✓ Активен</span>
        </div>
    `).join('');
}

/* ============================================
   Обновление доступности улучшений
   ============================================ */
function updateUpgradesAvailability() {
    // Обновляем только визуальное отображение, не перерисовываем всё
    upgrades.forEach(upgrade => {
        const card = document.querySelector(`.upgrade-card[data-upgrade-id="${upgrade.id}"]`);
        if (!card) return;
        
        const isPurchased = gameState.purchasedUpgrades.includes(upgrade.id);
        const canAfford = gameState.coins >= upgrade.cost;
        const canPurchase = canAfford && !isPurchased && canPurchaseUpgrade(upgrade);
        
        // Обновляем классы
        card.classList.remove('affordable', 'locked');
        if (isPurchased) {
            card.classList.add('purchased');
        } else if (canPurchase) {
            card.classList.add('affordable');
        } else if (!canPurchase) {
            card.classList.add('locked');
        }
        
        // Обновляем кнопку и стоимость
        const costValue = card.querySelector('.cost-value');
        const buyBtn = card.querySelector('.buy-upgrade-btn');
        
        if (costValue) {
            costValue.classList.toggle('insufficient', !canAfford);
        }
        
        if (buyBtn && !isPurchased) {
            buyBtn.disabled = !canPurchase;
            buyBtn.classList.toggle('disabled', !canPurchase);
            buyBtn.textContent = canAfford ? 'Купить' : 'Недостаточно';
        }
    });
}

/* ============================================
   Обновление реферальной информации
   ============================================ */
function updateReferralInfo() {
    const referralsCount = document.getElementById('referralsCount');
    const referralBonus = document.getElementById('referralBonus');
    
    if (referralsCount) {
        referralsCount.textContent = gameState.referralsCount || 0;
    }
    
    if (referralBonus) {
        referralBonus.textContent = `${gameState.referralBonus || 0}%`;
    }
    
    // Обновление информации о реферере (если есть)
    const referredByDisplay = document.getElementById('referredByDisplay');
    const referredByInfo = document.getElementById('referredByInfo');
    
    if (referredByDisplay && referredByInfo) {
        if (gameState.referredBy) {
            referredByDisplay.textContent = `Приглашен по коду: ${gameState.referredBy}`;
            referredByInfo.style.display = 'block';
        } else {
            referredByInfo.style.display = 'none';
        }
    }
}

/* ============================================
   Форматирование чисел
   ============================================ */
function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/* ============================================
   Настройка обработчиков событий
   ============================================ */
function setupEventListeners() {
    console.log('🎯 Настройка обработчиков событий...');
    
    // Кнопка тапа
    const tapButton = document.getElementById('tapButton');
    if (tapButton) {
        tapButton.addEventListener('click', handleTap);
        tapButton.addEventListener('touchstart', handleTap, { passive: true });
        console.log('✅ Обработчик тапа установлен');
    }
    
    // Кнопка копирования реферальной ссылки
    const copyReferralBtn = document.getElementById('copyReferralBtn');
    if (copyReferralBtn) {
        copyReferralBtn.addEventListener('click', copyReferralLink);
        console.log('✅ Обработчик копирования ссылки установлен');
    }
    
    // Меню
    const menuBtn = document.getElementById('menuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const menuOverlay = document.getElementById('menuOverlay');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', openMenu);
    }
    
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', closeMenu);
    }
    
    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeMenu);
    }
    
    // Пункты меню
        const statsMenuItem = document.getElementById('statsMenuItem');
        const settingsMenuItem = document.getElementById('settingsMenuItem');
        const aboutMenuItem = document.getElementById('aboutMenuItem');
        const referralStatsBtn = document.getElementById('showReferralStats');
        
        if (statsMenuItem) {
            statsMenuItem.addEventListener('click', showStats);
        }
        
        if (settingsMenuItem) {
            settingsMenuItem.addEventListener('click', showSettings);
        }
        
        if (aboutMenuItem) {
            aboutMenuItem.addEventListener('click', showAbout);
        }
        
        if (referralStatsBtn) {
            referralStatsBtn.addEventListener('click', showReferralStatsModal);
        }
        
        // Новые пункты меню
        const achievementsMenuItem = document.getElementById('achievementsMenuItem');
        const dailyBonusMenuItem = document.getElementById('dailyBonusMenuItem');
        const resetProgressMenuItem = document.getElementById('resetProgressMenuItem');
        
        if (achievementsMenuItem) {
            achievementsMenuItem.addEventListener('click', showAchievementsModal);
        }
        
        if (dailyBonusMenuItem) {
            dailyBonusMenuItem.addEventListener('click', showDailyBonusModal);
        }
        
        if (resetProgressMenuItem) {
            resetProgressMenuItem.addEventListener('click', confirmResetProgress);
        }
        
        // Кнопка ежедневного бонуса
        const claimBonusBtn = document.getElementById('claimBonusBtn');
        if (claimBonusBtn) {
            claimBonusBtn.addEventListener('click', claimDailyBonus);
        }
        
        // Обработка ошибок
        const errorCloseBtn = document.getElementById('errorCloseBtn');
        const errorOverlay = document.getElementById('errorOverlay');
        if (errorCloseBtn) {
            errorCloseBtn.addEventListener('click', () => {
                errorOverlay.style.display = 'none';
            });
        }
        
        // Обработка Easter eggs через тапы
        let easterEggInput = '';
        let easterEggTimeout = null;
        document.addEventListener('keydown', handleEasterEgg);
        
        console.log('✅ Все обработчики событий установлены');
    }

/* ============================================
   Копирование реферальной ссылки
   ============================================ */
function copyReferralLink() {
    console.log('📋 Копирование реферальной ссылки...');
    
    const referralInput = document.getElementById('referralLink');
    
    if (referralInput) {
        referralInput.select();
        referralInput.setSelectionRange(0, 99999); // Для мобильных устройств
        
        try {
            // Современный API
            navigator.clipboard.writeText(referralInput.value).then(() => {
                console.log('✅ Реферальная ссылка скопирована:', referralInput.value);
                showCopySuccess();
                
                // Тактильная обратная связь
                if (tg && tg.HapticFeedback) {
                    tg.HapticFeedback.notificationOccurred('success');
                }
            }).catch(err => {
                console.error('❌ Ошибка копирования:', err);
                fallbackCopy(referralInput.value);
            });
        } catch (err) {
            console.warn('⚠️ Clipboard API недоступен, используется fallback');
            fallbackCopy(referralInput.value);
        }
    }
}

/* ============================================
   Fallback для копирования (старый метод)
   ============================================ */
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        console.log('✅ Реферальная ссылка скопирована (fallback)');
        showCopySuccess();
    } catch (err) {
        console.error('❌ Ошибка копирования (fallback):', err);
    }
    
    document.body.removeChild(textArea);
}

/* ============================================
   Показ уведомления об успешном копировании
   ============================================ */
function showCopySuccess() {
    const copyBtn = document.getElementById('copyReferralBtn');
    if (copyBtn) {
        const originalContent = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span class="copy-icon">✓</span><span class="copy-text">Скопировано!</span>';
        copyBtn.style.background = 'linear-gradient(135deg, #6bcf7f 0%, #4ade80 100%)';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalContent;
            copyBtn.style.background = '';
        }, 2000);
    }
    
    // Показ уведомления в Telegram
    if (tg && tg.showAlert) {
        tg.showAlert('Реферальная ссылка скопирована!');
    }
}

/* ============================================
   Меню
   ============================================ */
function openMenu() {
    console.log('📂 Открытие меню...');
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    if (sideMenu) {
        sideMenu.classList.add('active');
        sideMenu.setAttribute('aria-hidden', 'false');
    }
    
    if (menuOverlay) {
        menuOverlay.classList.add('active');
        menuOverlay.setAttribute('aria-hidden', 'false');
    }
    
    if (tg && tg.BackButton) {
        tg.BackButton.show();
    }
}

function closeMenu() {
    console.log('📂 Закрытие меню...');
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    if (sideMenu) {
        sideMenu.classList.remove('active');
        sideMenu.setAttribute('aria-hidden', 'true');
    }
    
    if (menuOverlay) {
        menuOverlay.classList.remove('active');
        menuOverlay.setAttribute('aria-hidden', 'true');
    }
    
    if (tg && tg.BackButton) {
        tg.BackButton.hide();
    }
}

function showStats() {
    console.log('📊 Показ статистики...');
    closeMenu();
    
    let stats = `
📊 Статистика игры:

💰 Монет: ${formatNumber(gameState.coins)}
👆 Тапов: ${formatNumber(gameState.totalTaps)}
⚡ Монет за клик: ${gameState.coinsPerClick}
🚀 Кликов/сек: ${gameState.clicksPerSecond}
👥 Приглашено: ${gameState.referralsCount}
🎁 Бонус: ${gameState.referralBonus}%
    `;
    
    if (gameState.referredBy) {
        stats += `\n🔗 Приглашен: ${gameState.referredBy.substring(0, 12)}...`;
    }
    
    if (gameState.referralCode) {
        stats += `\n🔑 Ваш код: ${gameState.referralCode}`;
    }
    
    stats = stats.trim();
    
    if (tg && tg.showAlert) {
        tg.showAlert(stats);
    } else {
        alert(stats);
    }
}

function showSettings() {
    console.log('⚙️ Показ настроек...');
    closeMenu();
    
    if (tg && tg.showAlert) {
        tg.showAlert('Настройки будут добавлены в следующей версии');
    } else {
        alert('Настройки будут добавлены в следующей версии');
    }
}

function showAbout() {
    console.log('ℹ️ Показ информации об игре...');
    closeMenu();
    
    const version = appSettings.version || '1.0.0';
    const achievementsCount = achievementsState.achievements?.length || 0;
    const totalAchievements = achievements.length;
    
    const about = `
🎮 Тапалка

Увлекательная кликер-игра с реферальной системой!

Версия: ${version}

📊 Ваша статистика:
• Тапов: ${formatNumber(gameState.totalTaps)}
• Монет: ${formatNumber(gameState.coins)}
• Достижений: ${achievementsCount}/${totalAchievements}
• Приглашено друзей: ${gameState.referralsCount}

💡 Особенности:
• Система улучшений
• Ежедневные бонусы
• Реферальная система
• Достижения и награды

Приглашайте друзей и получайте бонусы!
    `.trim();
    
    if (tg && tg.showAlert) {
        tg.showAlert(about);
    } else {
        alert(about);
    }
}

/* ============================================
   Показ детальной статистики рефералов
   ============================================ */
function showReferralStatsModal() {
    console.log('📊 Показ детальной статистики рефералов...');
    closeMenu();
    
    let stats = `📊 Реферальная статистика:\n\n`;
    stats += `👥 Приглашено друзей: ${gameState.referralsCount || 0}\n`;
    stats += `🎁 Реферальный бонус: ${gameState.referralBonus || 0}%\n`;
    stats += `🔑 Ваш реферальный код: ${gameState.referralCode || 'Не создан'}\n\n`;
    
    if (gameState.referredBy) {
        stats += `🔗 Вы приглашены по коду: ${gameState.referredBy}\n\n`;
    }
    
    if (gameState.referrals && gameState.referrals.length > 0) {
        stats += `📋 Приглашенные друзья (${gameState.referrals.length}):\n`;
        gameState.referrals.slice(0, 10).forEach((refId, index) => {
            stats += `${index + 1}. ID: ${refId}\n`;
        });
        if (gameState.referrals.length > 10) {
            stats += `... и еще ${gameState.referrals.length - 10}`;
        }
    } else {
        stats += `📋 Пока нет приглашенных друзей`;
    }
    
    if (tg && tg.showAlert) {
        tg.showAlert(stats);
    } else {
        alert(stats);
    }
}

/* ============================================
   Система достижений
   ============================================ */
function initAchievements() {
    if (!gameState.achievements) {
        gameState.achievements = [];
    }
    console.log('🏆 Система достижений инициализирована');
}

function checkAchievements() {
    if (!achievements || achievements.length === 0) return;
    
    achievements.forEach(achievement => {
        // Проверяем, не получено ли уже достижение
        if (achievementsState.achievements.includes(achievement.id)) {
            return;
        }
        
        // Проверяем условие получения
        if (achievement.condition && achievement.condition(gameState)) {
            unlockAchievement(achievement);
        }
    });
}

function unlockAchievement(achievement) {
    console.log(`🏆 Достижение разблокировано: ${achievement.name}`);
    
    // Добавляем достижение в список полученных
    if (!achievementsState.achievements.includes(achievement.id)) {
        achievementsState.achievements.push(achievement.id);
    }
    
    // Начисляем награду
    if (achievement.reward) {
        gameState.coins += achievement.reward;
    }
    
    // Показываем уведомление
    showAchievementNotification(achievement);
    
    // Сохраняем прогресс
    saveGameState();
    updateUI();
}

function showAchievementNotification(achievement) {
    // Создаем элемент уведомления о достижении
    let badge = document.getElementById('achievementBadge');
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'achievementBadge';
        badge.className = 'achievement-badge';
        document.body.appendChild(badge);
    }
    
    badge.innerHTML = `
        <span class="achievement-icon">${achievement.icon}</span>
        <div class="achievement-content">
            <div class="achievement-title">Достижение получено!</div>
            <div class="achievement-description">${achievement.name}: ${achievement.description}</div>
        </div>
    `;
    
    badge.classList.add('show');
    
    // Скрываем через 4 секунды
    setTimeout(() => {
        badge.classList.remove('show');
    }, 4000);
    
    // Уведомление
    const rewardText = achievement.reward ? ` +${achievement.reward} монет` : '';
    showNotification(achievement.icon, achievement.name, achievement.description + rewardText, 'success', 5000);
    
    // Тактильная обратная связь
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
}

function showAchievementsModal() {
    console.log('🏆 Показ достижений...');
    closeMenu();
    
    const unlockedCount = achievementsState.achievements?.length || 0;
    const totalCount = achievements.length;
    
    let achievementsText = `🏆 Достижения: ${unlockedCount}/${totalCount}\n\n`;
    
    achievements.forEach(achievement => {
        const isUnlocked = achievementsState.achievements?.includes(achievement.id);
        const status = isUnlocked ? '✅' : '🔒';
        const progress = getAchievementProgress(achievement);
        
        achievementsText += `${status} ${achievement.icon} ${achievement.name}\n`;
        achievementsText += `   ${achievement.description}\n`;
        
        if (!isUnlocked && progress > 0) {
            achievementsText += `   Прогресс: ${progress}%\n`;
        }
        
        if (isUnlocked) {
            achievementsText += `   Награда: +${achievement.reward || 0} монет\n`;
        }
        
        achievementsText += '\n';
    });
    
    if (tg && tg.showAlert) {
        tg.showAlert(achievementsText);
    } else {
        alert(achievementsText);
    }
}

function getAchievementProgress(achievement) {
    // Вычисление прогресса для достижения (0-100%)
    if (!achievement.condition) return 0;
    
    // Временно меняем состояние для проверки прогресса
    const currentState = { ...gameState };
    let progress = 0;
    
    // Простая эвристика для прогресса
    if (achievement.id === 'first_tap' || achievement.id === 'hundred_taps' || achievement.id === 'thousand_taps') {
        const target = achievement.id === 'first_tap' ? 1 : achievement.id === 'hundred_taps' ? 100 : 1000;
        progress = Math.min(100, Math.round((gameState.totalTaps / target) * 100));
    } else if (achievement.id.includes('coins')) {
        const target = achievement.id === 'first_coins' ? 1 : achievement.id === 'hundred_coins' ? 100 : 1000;
        progress = Math.min(100, Math.round((gameState.coins / target) * 100));
    } else if (achievement.id.includes('upgrade')) {
        const target = achievement.id === 'first_upgrade' ? 1 : upgrades.length;
        progress = Math.min(100, Math.round((gameState.purchasedUpgrades.length / target) * 100));
    } else if (achievement.id.includes('referral')) {
        const target = achievement.id === 'first_referral' ? 1 : 5;
        progress = Math.min(100, Math.round((gameState.referralsCount / target) * 100));
    }
    
    return progress;
}

/* ============================================
   Ежедневный бонус
   ============================================ */
function initDailyBonus() {
    console.log('🎁 Инициализация ежедневного бонуса...');
    
    // Обновляем таймер
    updateDailyBonusTimer();
    
    // Проверяем доступность бонуса
    checkDailyBonusAvailability();
    
    // Запускаем обновление таймера каждую секунду
    setInterval(updateDailyBonusTimer, 1000);
}

function checkDailyBonusAvailability() {
    const now = Date.now();
    const lastBonus = dailyBonusState.lastBonusDate || 0;
    const timeSinceLastBonus = now - lastBonus;
    const oneDay = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
    
    const claimBtn = document.getElementById('claimBonusBtn');
    const dailySection = document.getElementById('dailyBonusSection');
    
    if (dailySection) {
        dailySection.style.display = 'flex';
    }
    
    if (timeSinceLastBonus >= oneDay || !lastBonus) {
        // Бонус доступен
        if (claimBtn) {
            claimBtn.disabled = false;
            claimBtn.classList.add('available');
        }
        dailyBonusState.nextBonusTime = null;
    } else {
        // Бонус недоступен, вычисляем время до следующего
        const timeUntilNext = oneDay - timeSinceLastBonus;
        dailyBonusState.nextBonusTime = now + timeUntilNext;
        if (claimBtn) {
            claimBtn.disabled = true;
            claimBtn.classList.remove('available');
        }
    }
    
    updateDailyBonusDisplay();
}

function updateDailyBonusTimer() {
    const timerValue = document.getElementById('timerValue');
    const claimBtn = document.getElementById('claimBonusBtn');
    
    if (!dailyBonusState.nextBonusTime) {
        checkDailyBonusAvailability();
        return;
    }
    
    const now = Date.now();
    const timeLeft = dailyBonusState.nextBonusTime - now;
    
    if (timeLeft <= 0) {
        // Бонус доступен
        if (timerValue) {
            timerValue.textContent = 'Доступно!';
        }
        if (claimBtn) {
            claimBtn.disabled = false;
            claimBtn.classList.add('available');
        }
        dailyBonusState.nextBonusTime = null;
        return;
    }
    
    // Форматируем время
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    if (timerValue) {
        timerValue.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    
    if (claimBtn) {
        claimBtn.disabled = true;
        claimBtn.classList.remove('available');
    }
}

function updateDailyBonusDisplay() {
    const streakValue = document.getElementById('streakValue');
    if (streakValue) {
        streakValue.textContent = dailyBonusState.bonusStreak || 0;
    }
}

function claimDailyBonus() {
    const claimBtn = document.getElementById('claimBonusBtn');
    if (claimBtn && claimBtn.disabled) {
        return;
    }
    
    const now = Date.now();
    const lastBonus = dailyBonusState.lastBonusDate || 0;
    const timeSinceLastBonus = now - lastBonus;
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Проверка, что прошло 24 часа
    if (timeSinceLastBonus < oneDay && dailyBonusState.lastBonusDate) {
        showNotification('⏰', 'Бонус недоступен', 'Подождите до следующего дня', 'warning');
        return;
    }
    
    // Вычисляем бонус (зависит от серии дней)
    let bonusAmount = 50; // Базовый бонус
    const streak = dailyBonusState.bonusStreak || 0;
    
    // Бонус за серию дней
    if (streak > 0) {
        bonusAmount += streak * 10; // +10 монет за каждый день серии
    }
    
    // Проверка, не прервана ли серия
    if (dailyBonusState.lastBonusDate) {
        const daysSinceLastBonus = Math.floor(timeSinceLastBonus / oneDay);
        if (daysSinceLastBonus === 1) {
            // Серия продолжается
            dailyBonusState.bonusStreak = (dailyBonusState.bonusStreak || 0) + 1;
        } else if (daysSinceLastBonus > 1) {
            // Серия прервана
            dailyBonusState.bonusStreak = 1;
        }
    } else {
        // Первый бонус
        dailyBonusState.bonusStreak = 1;
    }
    
    // Начисляем бонус
    gameState.coins += bonusAmount;
    dailyBonusState.lastBonusDate = now;
    
    // Сохраняем
    localStorage.setItem('lastBonusDate', dailyBonusState.lastBonusDate.toString());
    localStorage.setItem('bonusStreak', dailyBonusState.bonusStreak.toString());
    saveGameState();
    
    // Обновляем UI
    updateUI();
    updateDailyBonusDisplay();
    checkDailyBonusAvailability();
    
    // Показываем уведомление
    const streakText = dailyBonusState.bonusStreak > 1 ? ` (Серия: ${dailyBonusState.bonusStreak} дней)` : '';
    showNotification('🎁', 'Ежедневный бонус!', `Получено ${bonusAmount} монет${streakText}`, 'success', 5000);
    
    // Тактильная обратная связь
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
        tg.HapticFeedback.impactOccurred('medium');
    }
    
    console.log(`🎁 Ежедневный бонус получен: ${bonusAmount} монет (серия: ${dailyBonusState.bonusStreak})`);
}

function showDailyBonusModal() {
    closeMenu();
    
    const streak = dailyBonusState.bonusStreak || 0;
    const lastBonus = dailyBonusState.lastBonusDate ? new Date(dailyBonusState.lastBonusDate).toLocaleString('ru') : 'Никогда';
    
    let bonusInfo = `🎁 Ежедневный бонус\n\n`;
    bonusInfo += `📅 Последний бонус: ${lastBonus}\n`;
    bonusInfo += `🔥 Серия дней: ${streak}\n\n`;
    
    if (dailyBonusState.nextBonusTime) {
        const timeLeft = dailyBonusState.nextBonusTime - Date.now();
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        bonusInfo += `⏰ Следующий бонус через: ${hours}ч ${minutes}м\n\n`;
    } else {
        bonusInfo += `✅ Бонус доступен!\n\n`;
    }
    
    bonusInfo += `💰 Базовый бонус: 50 монет\n`;
    bonusInfo += `🔥 Бонус за серию: +10 монет за каждый день\n`;
    bonusInfo += `💎 Максимальный бонус: ${50 + streak * 10} монет`;
    
    if (tg && tg.showAlert) {
        tg.showAlert(bonusInfo);
    } else {
        alert(bonusInfo);
    }
}

/* ============================================
   Сброс прогресса
   ============================================ */
function confirmResetProgress() {
    closeMenu();
    
    const confirmMessage = `⚠️ ВНИМАНИЕ!\n\nВы действительно хотите сбросить весь прогресс?\n\nЭто действие невозможно отменить!\n\nБудут удалены:\n• Все монеты\n• Все улучшения\n• Вся статистика\n• Достижения\n\nРеферальная система сохранится.`;
    
    if (tg && tg.showConfirm) {
        tg.showConfirm(confirmMessage, (confirmed) => {
            if (confirmed) {
                resetProgress();
            }
        });
    } else {
        if (confirm(confirmMessage)) {
            resetProgress();
        }
    }
}

function resetProgress() {
    console.log('🗑️ Сброс прогресса...');
    
    // Сохраняем реферальную систему
    const referralCode = gameState.referralCode;
    const referredBy = gameState.referredBy;
    const referralBonus = gameState.referralBonus;
    const referralsCount = gameState.referralsCount;
    const referrals = gameState.referrals;
    
    // Сбрасываем игровые данные
    gameState.coins = 0;
    gameState.totalTaps = 0;
    gameState.coinsPerClick = 1;
    gameState.clicksPerSecond = 0;
    gameState.purchasedUpgrades = [];
    
    // Сбрасываем достижения и ежедневный бонус
    achievementsState.achievements = [];
    dailyBonusState.lastBonusDate = null;
    dailyBonusState.bonusStreak = 0;
    dailyBonusState.nextBonusTime = null;
    
    // Восстанавливаем реферальную систему
    gameState.referralCode = referralCode;
    gameState.referredBy = referredBy;
    gameState.referralBonus = referralBonus;
    gameState.referralsCount = referralsCount;
    gameState.referrals = referrals;
    
    // Останавливаем все автокликеры
    stopAllAutoClickers();
    
    // Очищаем localStorage (кроме реферальных данных)
    localStorage.removeItem('tapGameState');
    localStorage.removeItem('achievements');
    localStorage.removeItem('lastBonusDate');
    localStorage.removeItem('bonusStreak');
    localStorage.setItem('tapGameReferralCode', referralCode || '');
    
    // Сохраняем новое состояние
    saveGameState();
    
    // Обновляем UI
    updateUI();
    renderUpgrades();
    initUpgrades();
    checkDailyBonusAvailability();
    
    // Показываем уведомление
    showNotification('🗑️', 'Прогресс сброшен', 'Начните игру заново!', 'info', 3000);
    
    console.log('✅ Прогресс сброшен');
}

/* ============================================
   Easter Eggs
   ============================================ */
let easterEggSequence = '';
const easterEggTimeoutDuration = 2000; // 2 секунды для ввода последовательности

function handleEasterEgg(event) {
    const key = event.key.toUpperCase();
    
    // Добавляем символ к последовательности
    easterEggSequence += key;
    
    // Проверяем Easter eggs
    Object.keys(easterEggs).forEach(sequence => {
        if (easterEggSequence.toUpperCase().includes(sequence)) {
            if (easterEggs[sequence]()) {
                easterEggSequence = ''; // Сброс после активации
                return;
            }
        }
    });
    
    // Очищаем последовательность через таймаут
    clearTimeout(easterEggTimeout);
    easterEggTimeout = setTimeout(() => {
        easterEggSequence = '';
    }, easterEggTimeoutDuration);
    
    // Ограничиваем длину последовательности
    if (easterEggSequence.length > 20) {
        easterEggSequence = easterEggSequence.slice(-20);
    }
}

/* ============================================
   Проверка обновлений
   ============================================ */
function checkForUpdates() {
    // Проверка новой версии приложения
    const savedVersion = localStorage.getItem('appVersion');
    const currentVersion = appSettings.version || '1.0.0';
    
    if (savedVersion && savedVersion !== currentVersion) {
        setTimeout(() => {
            showNotification('🆕', 'Обновление доступно!', `Версия ${currentVersion} с новыми функциями!`, 'info', 6000);
        }, 2000);
    }
}

/* ============================================
   Обновление проверки достижений при тапе
   ============================================ */

/* ============================================
   Service Worker для PWA
   ============================================ */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker зарегистрирован:', registration.scope);
                    
                    // Проверка обновлений
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                showNotification('🔄', 'Обновление доступно', 'Перезагрузите страницу для применения', 'info', 10000);
                            }
                        });
                    });
                })
                .catch(error => {
                    console.warn('⚠️ Service Worker не зарегистрирован:', error);
                });
        });
    }
}

/* ============================================
   Сохранение состояния игры
   ============================================ */
function saveGameState() {
    try {
        const stateToSave = {
            coins: gameState.coins,
            totalTaps: gameState.totalTaps,
            coinsPerClick: gameState.coinsPerClick,
            clicksPerSecond: gameState.clicksPerSecond,
            referralsCount: gameState.referralsCount,
            referralBonus: gameState.referralBonus,
            referredBy: gameState.referredBy,
            purchasedUpgrades: gameState.purchasedUpgrades || [],
            achievements: achievementsState.achievements || [],
            lastBonusDate: dailyBonusState.lastBonusDate,
            bonusStreak: dailyBonusState.bonusStreak,
            nextBonusTime: dailyBonusState.nextBonusTime,
            version: appSettings.version,
            timestamp: Date.now()
        };
        
        // Сохранение достижений отдельно
        localStorage.setItem('achievements', JSON.stringify(achievementsState.achievements));
        
        // Сохранение ежедневного бонуса
        if (dailyBonusState.lastBonusDate) {
            localStorage.setItem('lastBonusDate', dailyBonusState.lastBonusDate.toString());
        }
        localStorage.setItem('bonusStreak', dailyBonusState.bonusStreak.toString());
        
        // Сохранение версии
        localStorage.setItem('appVersion', appSettings.version);
        
        localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(stateToSave));
        
        if (gameState.userId) {
            localStorage.setItem(STORAGE_KEYS.USER_ID, gameState.userId.toString());
        }
        
        if (gameState.referralCode) {
            localStorage.setItem(STORAGE_KEYS.REFERRAL_CODE, gameState.referralCode);
        }
        
        console.log('💾 Состояние игры сохранено:', stateToSave);
        
        // Синхронизация с Firebase (асинхронно, не блокируем сохранение)
        if (window.FirebaseService && window.FirebaseService.isInitialized() && gameState.userId && !appSettings.offlineMode) {
            syncGameStateToFirebase().catch(error => {
                console.warn('⚠️ Ошибка синхронизации с Firebase:', error);
                // Не критично, данные сохранены локально
            });
        }
    } catch (error) {
        console.error('❌ Ошибка сохранения состояния:', error);
        showError('Ошибка сохранения', 'Не удалось сохранить прогресс. Пожалуйста, проверьте соединение.');
    }
}

/* ============================================
   Загрузка состояния игры
   ============================================ */
function loadGameState() {
    console.log('📂 Загрузка сохраненного состояния...');
    
    try {
        // Загрузка игрового состояния
        const savedState = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            
            gameState.coins = parsedState.coins || 0;
            gameState.totalTaps = parsedState.totalTaps || 0;
            gameState.coinsPerClick = parsedState.coinsPerClick || 1;
            gameState.clicksPerSecond = parsedState.clicksPerSecond || 0;
            gameState.referralsCount = parsedState.referralsCount || 0;
            gameState.referralBonus = parsedState.referralBonus || 0;
            gameState.referredBy = parsedState.referredBy || null;
            gameState.purchasedUpgrades = parsedState.purchasedUpgrades || [];
            
            // Загрузка достижений
            achievementsState.achievements = parsedState.achievements || [];
            achievementsState.showAchievements = parsedState.showAchievements !== undefined ? parsedState.showAchievements : true;
            
            // Загрузка ежедневного бонуса
            dailyBonusState.lastBonusDate = parsedState.lastBonusDate || null;
            dailyBonusState.bonusStreak = parsedState.bonusStreak || 0;
            dailyBonusState.nextBonusTime = parsedState.nextBonusTime || null;
            
            console.log('✅ Состояние игры загружено:', parsedState);
            
            // Инициализация улучшений после загрузки (если еще не инициализированы)
            if (gameState.purchasedUpgrades && gameState.purchasedUpgrades.length > 0) {
                // Останавливаем все автокликеры перед перезапуском
                stopAllAutoClickers();
                
                // Запускаем активные автокликеры
                gameState.purchasedUpgrades.forEach(upgradeId => {
                    const upgrade = upgrades.find(u => u.id === upgradeId);
                    if (upgrade && upgrade.autoClicker) {
                        startAutoClicker(upgrade);
                    }
                });
                
                // Обновляем CPS
                updateClicksPerSecond();
            }
        }
        
        // Загрузка ежедневного бонуса из localStorage
        const lastBonusStr = localStorage.getItem('lastBonusDate');
        const streakStr = localStorage.getItem('bonusStreak');
        if (lastBonusStr) dailyBonusState.lastBonusDate = parseInt(lastBonusStr);
        if (streakStr) dailyBonusState.bonusStreak = parseInt(streakStr);
        
        // Загрузка достижений из localStorage
        const savedAchievements = localStorage.getItem('achievements');
        if (savedAchievements) {
            try {
                achievementsState.achievements = JSON.parse(savedAchievements);
            } catch (e) {
                console.warn('⚠️ Ошибка загрузки достижений:', e);
            }
        }
        
        // Загрузка ID пользователя
        const savedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        if (savedUserId && !gameState.userId) {
            gameState.userId = parseInt(savedUserId);
            console.log('✅ ID пользователя загружен:', gameState.userId);
        }
        
        // Загрузка реферального кода
        const savedReferralCode = localStorage.getItem(STORAGE_KEYS.REFERRAL_CODE);
        if (savedReferralCode && !gameState.referralCode) {
            gameState.referralCode = savedReferralCode;
            console.log('✅ Реферальный код загружен:', gameState.referralCode);
        }
        
    } catch (error) {
        console.error('❌ Ошибка загрузки состояния:', error);
    }
}

/* ============================================
   Debounce для автосохранения
   ============================================ */
let saveTimeout = null;
function debounceSave() {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }
    
    saveTimeout = setTimeout(() => {
        saveGameState();
    }, 1000); // Сохранение через 1 секунду после последнего изменения
}

/* ============================================
   Автосохранение при закрытии страницы
   ============================================ */
window.addEventListener('beforeunload', () => {
    console.log('💾 Автосохранение перед закрытием...');
    saveGameState();
});

// Периодическое автосохранение (каждые 30 секунд)
setInterval(() => {
    saveGameState();
    console.log('💾 Периодическое автосохранение выполнено');
}, 30000);

// Очистка интервалов при закрытии страницы
window.addEventListener('beforeunload', () => {
    stopAllAutoClickers();
});

/* ============================================
   Добавление CSS класса для анимации тапа
   ============================================ */
const style = document.createElement('style');
style.textContent = `
    .tap-animate {
        animation: tapAnim 0.5s ease-out forwards;
    }
    
    @keyframes tapAnim {
        0% {
            opacity: 0;
            transform: translateY(0) scale(0.5);
        }
        50% {
            opacity: 1;
            transform: translateY(-40px) scale(1.2);
        }
        100% {
            opacity: 0;
            transform: translateY(-80px) scale(0.8);
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Инициализация завершена
console.log('📝 script.js загружен и готов к работе');

// Проверка версии приложения
if (typeof appSettings !== 'undefined') {
    console.log(`📱 Версия приложения: ${appSettings.version || '1.0.0'}`);
}
