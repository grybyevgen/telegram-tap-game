# Инструкция по настройке Firebase

## Шаг 1: Создание проекта в Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите "Add project" (Добавить проект)
3. Введите название проекта (например, "tap-game")
4. Отключите Google Analytics (опционально)
5. Нажмите "Create project"

## Шаг 2: Добавление веб-приложения

1. В Firebase Console выберите ваш проект
2. Нажмите на иконку веб-приложения (</>)
3. Зарегистрируйте приложение:
   - **App nickname**: Тапалка
   - **Firebase Hosting** (опционально): можно настроить позже
4. Скопируйте конфигурацию Firebase

## Шаг 3: Настройка Firestore Database

1. В Firebase Console перейдите в **Firestore Database**
2. Нажмите "Create database"
3. Выберите режим:
   - **Production mode** (рекомендуется для продакшена)
   - **Test mode** (для разработки, отключится через 30 дней)
4. Выберите регион (например, `europe-west` или `us-central`)
5. Нажмите "Enable"

## Шаг 4: Настройка правил безопасности

В разделе Firestore Database -> Rules вставьте:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Коллекция пользователей
    match /users/{userId} {
      // Чтение: любой может читать для рейтинга
      allow read: if true;
      // Запись: только свой документ или новый пользователь
      allow create: if request.resource.data.userId == userId;
      allow update: if request.resource.data.userId == userId 
                   && resource.data.userId == userId;
      allow delete: if false; // Удаление запрещено
    }
    
    // Коллекция рефералов
    match /referrals/{referralCode} {
      // Чтение реферальных кодов (публичное)
      allow read: if true;
      // Создание и обновление: только авторизованные пользователи
      allow write: if true; // Упрощенная версия для начала
    }
  }
}
```

**⚠️ ВНИМАНИЕ**: Эти правила разрешают публичную запись. Для продакшена настройте более строгие правила с аутентификацией!

## Шаг 5: Создание индексов для рейтинга

1. Перейдите в **Firestore Database** -> **Indexes**
2. Нажмите "Create Index"
3. Настройте индекс:
   - **Collection ID**: `users`
   - **Fields to index**: 
     - `coins` (Descending)
   - **Query scope**: Collection
4. Нажмите "Create"

Создайте также индекс для сортировки по `totalTaps`:
- Collection: `users`
- Field: `totalTaps` (Descending)

## Шаг 6: Настройка конфигурации в проекте

### Вариант A: С использованием сборщика (Vite/Webpack)

1. Создайте файл `.env` в корне проекта:
```bash
cp env.example .env
```

2. Откройте `.env` и заполните значения из Firebase Console:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

3. Установите Firebase через npm:
```bash
npm install firebase
```

4. Обновите `firebase-config.js` для использования модулей:
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

### Вариант B: Без сборщика (простой HTML)

1. Подключите Firebase через CDN в `index.html`:
```html
<!-- Firebase SDK -->
<script type="module">
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
  import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
  
  // Замените на ваши значения
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  
  window.firebaseApp = initializeApp(firebaseConfig);
  window.firebaseDb = getFirestore(window.firebaseApp);
</script>
```

2. Или обновите функцию `getFirebaseConfig()` в `firebase-config.js` с прямыми значениями:
```javascript
function getFirebaseConfig() {
    return {
        apiKey: "AIzaSy...", // Ваш API Key
        authDomain: "your-project.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abc123"
    };
}
```

## Шаг 7: Инициализация Firebase в приложении

В файле `script.js` добавьте инициализацию:

```javascript
// После загрузки DOM
document.addEventListener('DOMContentLoaded', async () => {
    // Инициализация Firebase
    await FirebaseService.init();
    
    // Загрузка данных пользователя из Firebase
    if (gameState.userId) {
        const userData = await FirebaseService.getUserData(gameState.userId);
        if (userData) {
            // Обновить gameState данными из Firebase
            gameState.coins = userData.coins || 0;
            gameState.totalTaps = userData.totalTaps || 0;
            // ... остальные поля
            updateUI();
        }
    }
});
```

## Шаг 8: Тестирование

1. Откройте консоль браузера (F12)
2. Проверьте сообщения об инициализации Firebase
3. Попробуйте сохранить данные:
```javascript
await FirebaseService.saveUserProgress(12345, {
    coins: 100,
    totalTaps: 50,
    coinsPerClick: 1
});
```
4. Проверьте данные в Firebase Console -> Firestore Database

## Решение проблем

### Ошибка: "Firebase not initialized"
- Убедитесь, что вы вызвали `FirebaseService.init()`
- Проверьте, что конфигурация Firebase правильная
- Проверьте консоль браузера на ошибки загрузки Firebase SDK

### Ошибка: "Missing or insufficient permissions"
- Проверьте правила безопасности Firestore
- Убедитесь, что правила сохранены и опубликованы

### Ошибка: "The query requires an index"
- Создайте недостающий индекс в Firebase Console
- Следуйте ссылке из ошибки для создания индекса

### Данные не сохраняются
- Проверьте правила безопасности Firestore
- Убедитесь, что Firebase инициализирован
- Проверьте консоль браузера на ошибки

## Дополнительные ресурсы

- [Документация Firebase](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
