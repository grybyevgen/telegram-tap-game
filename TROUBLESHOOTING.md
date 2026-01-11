# Решение типичных проблем при деплое Telegram Mini App

## Оглавление
- [Проблемы с деплоем](#проблемы-с-деплоем)
- [Проблемы с Firebase](#проблемы-с-firebase)
- [Проблемы с Telegram](#проблемы-с-telegram)
- [Проблемы с реферальной системой](#проблемы-с-реферальной-системой)
- [Проблемы с улучшениями](#проблемы-с-улучшениями)
- [Производительность](#производительность)

---

## Проблемы с деплоем

### Проблема: "404 Not Found" после деплоя на GitHub Pages

**Причина:** GitHub Pages не может найти `index.html` или неправильная структура папок.

**Решение:**
1. Убедитесь, что `index.html` находится в корне репозитория или в папке `docs/`
2. В Settings → Pages выберите правильную папку (root или /docs)
3. Проверьте структуру:
   ```
   repo-root/
   ├── index.html
   ├── style.css
   ├── script.js
   └── ...
   ```

### Проблема: CORS ошибки при загрузке ресурсов

**Причина:** Сервер блокирует запросы из разных источников.

**Решение:**
- Для Firebase: правила CORS настраиваются автоматически
- Для других ресурсов: добавьте заголовки CORS на сервере
- Проверьте, что все ресурсы загружаются с того же домена или с правильными CORS заголовками

### Проблема: Переменные окружения не работают на GitHub Pages

**Причина:** GitHub Pages не поддерживает переменные окружения напрямую.

**Решение:**
1. Используйте прямое указание конфигурации в `firebase-config.js`
2. Или используйте Netlify/Vercel, которые поддерживают переменные окружения
3. Или используйте секреты GitHub Actions (для автоматического деплоя)

**Пример обновления `firebase-config.js`:**
```javascript
function getFirebaseConfig() {
    // Прямая конфигурация (для GitHub Pages)
    return {
        apiKey: "ваш_api_key_здесь",
        authDomain: "ваш_проект.firebaseapp.com",
        // ... остальные параметры
    };
}
```

---

## Проблемы с Firebase

### Проблема: "Firebase not initialized"

**Причина:** Firebase SDK не загружается или конфигурация неверна.

**Решение:**
1. Проверьте консоль браузера на ошибки загрузки Firebase
2. Убедитесь, что Firebase конфигурация правильная:
   ```javascript
   // Проверьте все поля заполнены
   console.log(getFirebaseConfig());
   ```
3. Проверьте, что Firebase модули загружаются:
   ```javascript
   // В консоли браузера
   import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js')
     .then(() => console.log('Firebase загружен'))
     .catch(err => console.error('Ошибка загрузки:', err));
   ```

### Проблема: "Missing or insufficient permissions"

**Причина:** Правила Firestore слишком строгие или неверные.

**Решение:**
1. Проверьте правила в Firebase Console → Firestore → Rules
2. Для тестирования используйте временные правила:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true; // ТОЛЬКО ДЛЯ ТЕСТИРОВАНИЯ!
       }
     }
   }
   ```
3. Для продакшена используйте правила из `DEPLOYMENT.md`

### Проблема: "The query requires an index"

**Причина:** Запрос требует создания индекса в Firestore.

**Решение:**
1. Откройте ошибку в консоли браузера
2. Нажмите на ссылку в ошибке (она ведет на создание индекса)
3. Или создайте индекс вручную:
   - Firestore Database → Indexes → Create Index
   - Укажите коллекцию и поля из запроса

### Проблема: Данные не сохраняются в Firestore

**Причина:** Ошибки записи или неправильные правила.

**Решение:**
1. Проверьте консоль браузера на ошибки
2. Проверьте правила Firestore (должны разрешать запись)
3. Убедитесь, что Firebase инициализирован:
   ```javascript
   console.log('Firebase initialized:', window.FirebaseService?.isInitialized());
   ```
4. Проверьте формат данных перед сохранением

---

## Проблемы с Telegram

### Проблема: Приложение не открывается в Telegram

**Причина:** Неверный URL, отсутствие HTTPS, или проблемы с настройками бота.

**Решение:**
1. ✅ **Проверьте HTTPS:** Telegram требует HTTPS для Mini Apps
   - GitHub Pages: автоматически HTTPS
   - Netlify/Vercel: автоматически HTTPS
   - Firebase Hosting: автоматически HTTPS

2. ✅ **Проверьте URL в @BotFather:**
   ```
   /mybots → Выберите бота → Bot Settings → Mini Apps → Edit
   Убедитесь, что URL правильный: https://your-domain.com
   ```

3. ✅ **Проверьте доступность URL:**
   ```bash
   curl -I https://your-domain.com
   # Должен вернуть 200 OK
   ```

4. ✅ **Проверьте, что URL публично доступен** (не требует авторизации)

### Проблема: "Telegram Web App SDK не найден"

**Причина:** Приложение открывается не через Telegram или SDK не загружается.

**Решение:**
1. Убедитесь, что открываете через Telegram (не в браузере напрямую)
2. Проверьте, что скрипт подключен в `index.html`:
   ```html
   <script src="https://telegram.org/js/telegram-web-app.js"></script>
   ```
3. Для тестирования вне Telegram используйте `@WebAppTestBot`

### Проблема: Данные пользователя не получаются

**Причина:** Пользователь не авторизован или данные недоступны.

**Решение:**
1. Проверьте консоль на ошибки
2. Убедитесь, что открываете через Telegram бота (не прямой URL)
3. Для тестирования добавьте fallback:
   ```javascript
   if (!tg?.initDataUnsafe?.user) {
       console.warn('Telegram данные недоступны, используем тестового пользователя');
       createTestUser();
   }
   ```

### Проблема: Кнопка меню не работает

**Причина:** Неправильная настройка Menu Button в @BotFather.

**Решение:**
1. Проверьте настройки:
   ```
   /mybots → Ваш бот → Bot Settings → Menu Button
   ```
2. Убедитесь, что URL правильный
3. Перезапустите бота (остановите и запустите заново)

---

## Проблемы с реферальной системой

### Проблема: Реферальные ссылки не работают

**Причина:** Неверный формат кода или проблемы с обработкой URL параметров.

**Решение:**
1. Проверьте формат реферального кода:
   ```javascript
   // Код должен начинаться с "TAP" и содержать 8-12 символов
   /^TAP[A-Z0-9]{8,12}$/.test(referralCode)
   ```

2. Проверьте обработку URL параметров:
   ```javascript
   const urlParams = new URLSearchParams(window.location.search);
   const refCode = urlParams.get('ref');
   console.log('Referral code from URL:', refCode);
   ```

3. Проверьте, что реферальный код сохраняется в Firebase:
   - Firebase Console → Firestore → collection `referrals`
   - Должен существовать документ с ID = referralCode

### Проблема: Бонус не начисляется рефереру

**Причина:** Ошибка при регистрации реферала или проблемы с Firebase.

**Решение:**
1. Проверьте логи в консоли при первом тапе нового пользователя
2. Убедитесь, что функция `processReferralBonus()` вызывается
3. Проверьте правила Firestore для коллекции `users` (должны разрешать update)
4. Проверьте, что `registerReferral()` выполняется успешно:
   ```javascript
   const result = await FirebaseService.registerReferral(code, userId, data);
   console.log('Referral registration result:', result);
   ```

### Проблема: Реферальный код не генерируется

**Причина:** Проблемы с функцией генерации или отсутствие userId.

**Решение:**
1. Проверьте, что `gameState.userId` установлен:
   ```javascript
   console.log('User ID:', gameState.userId);
   ```
2. Проверьте функцию `generateReferralCode()`:
   ```javascript
   const code = generateReferralCode(gameState.userId);
   console.log('Generated code:', code);
   ```
3. Убедитесь, что код сохраняется в localStorage:
   ```javascript
   console.log('Saved code:', localStorage.getItem('tapGameReferralCode'));
   ```

---

## Проблемы с улучшениями

### Проблема: Улучшения не отображаются

**Причина:** Ошибка рендеринга или отсутствие контейнера.

**Решение:**
1. Проверьте, что элемент существует:
   ```javascript
   const container = document.getElementById('upgradesContainer');
   console.log('Container found:', !!container);
   ```
2. Проверьте, что функция `renderUpgrades()` вызывается:
   ```javascript
   renderUpgrades();
   ```
3. Проверьте консоль на ошибки JavaScript

### Проблема: Улучшения не покупаются

**Причина:** Недостаточно монет или проблемы с функцией покупки.

**Решение:**
1. Проверьте количество монет:
   ```javascript
   console.log('Current coins:', gameState.coins);
   console.log('Upgrade cost:', upgrade.cost);
   ```
2. Проверьте, что функция `buyUpgrade()` доступна глобально:
   ```javascript
   console.log('buyUpgrade available:', typeof window.buyUpgrade);
   ```
3. Проверьте требования для покупки:
   ```javascript
   console.log('Can purchase:', canPurchaseUpgrade(upgrade));
   ```

### Проблема: Автокликеры не работают

**Причина:** Интервалы не запускаются или очищаются.

**Решение:**
1. Проверьте, что автокликеры запускаются:
   ```javascript
   console.log('Auto-clicker intervals:', autoClickerIntervals.length);
   ```
2. Проверьте, что интервалы не очищаются преждевременно
3. Убедитесь, что `stopAllAutoClickers()` не вызывается случайно
4. Проверьте консоль на ошибки в функции `startAutoClicker()`

---

## Производительность

### Проблема: Медленная загрузка приложения

**Причина:** Большие файлы или медленный хостинг.

**Решение:**
1. Оптимизируйте изображения (используйте WebP, сжимайте PNG)
2. Минифицируйте CSS и JavaScript (для продакшена)
3. Используйте CDN для статических ресурсов
4. Включите кеширование на сервере

### Проблема: Высокое потребление памяти

**Причина:** Утечки памяти от интервалов или слушателей событий.

**Решение:**
1. Убедитесь, что все интервалы очищаются:
   ```javascript
   window.addEventListener('beforeunload', () => {
       stopAllAutoClickers();
   });
   ```
2. Удаляйте неиспользуемые слушатели событий
3. Проверьте использование памяти в DevTools → Memory

### Проблема: Данные не сохраняются

**Причина:** Проблемы с localStorage или Firebase.

**Решение:**
1. Проверьте доступность localStorage:
   ```javascript
   try {
       localStorage.setItem('test', 'test');
       localStorage.removeItem('test');
       console.log('localStorage доступен');
   } catch (e) {
       console.error('localStorage недоступен:', e);
   }
   ```
2. Проверьте квоту localStorage (обычно 5-10MB)
3. Для Firebase проверьте правила и квоты

---

## Отладка

### Включение подробных логов

Добавьте в начало `script.js`:

```javascript
// Включение детального логирования
const DEBUG = true;

function debugLog(...args) {
    if (DEBUG) {
        console.log('[DEBUG]', ...args);
    }
}

// Используйте вместо console.log для отладки
debugLog('Game state:', gameState);
```

### Проверка состояния игры

Откройте консоль браузера и выполните:

```javascript
// Проверить состояние игры
console.log('Game State:', gameState);

// Проверить Firebase
console.log('Firebase initialized:', window.FirebaseService?.isInitialized());

// Проверить Telegram
console.log('Telegram WebApp:', window.Telegram?.WebApp);

// Проверить localStorage
console.log('LocalStorage:', {
    gameState: localStorage.getItem('tapGameState'),
    userId: localStorage.getItem('tapGameUserId'),
    referralCode: localStorage.getItem('tapGameReferralCode')
});
```

### Проверка сетевых запросов

1. Откройте DevTools (F12)
2. Перейдите на вкладку Network
3. Фильтруйте по "firestore" или "firebase"
4. Проверьте статус запросов (должны быть 200 OK)

---

## Получение помощи

Если проблема не решена:

1. ✅ Проверьте все пункты из чеклиста в `DEPLOYMENT.md`
2. ✅ Проверьте консоль браузера на ошибки
3. ✅ Проверьте логи Firebase Console
4. ✅ Создайте issue в GitHub репозитории с:
   - Описанием проблемы
   - Шагами для воспроизведения
   - Скриншотами ошибок
   - Логами из консоли

---

## Полезные команды для отладки

```bash
# Проверка доступности сайта
curl -I https://your-domain.com

# Проверка HTTPS сертификата
openssl s_client -connect your-domain.com:443

# Проверка заголовков
curl -v https://your-domain.com

# Локальное тестирование с HTTPS (для тестирования Telegram)
npx local-ssl-proxy --source 3001 --target 3000
```

---

## Часто задаваемые вопросы

**Q: Можно ли использовать HTTP вместо HTTPS?**
A: Нет, Telegram требует HTTPS для Mini Apps.

**Q: Нужен ли домен или можно использовать поддомен?**
A: Можно использовать поддомен (например, `username.github.io` или `app.netlify.app`).

**Q: Как часто сохраняются данные?**
A: Данные сохраняются автоматически при каждом изменении (с debounce 1 секунда) и каждые 30 секунд.

**Q: Сколько пользователей может поддерживать приложение?**
A: Зависит от Firebase плана. Бесплатный план (Spark) поддерживает до 50,000 одновременных подключений.

**Q: Можно ли использовать приложение без Firebase?**
A: Да, приложение работает с localStorage, но без синхронизации между устройствами.
