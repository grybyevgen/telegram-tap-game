/* ============================================
   Firebase Configuration для Telegram Mini App "Тапалка"
   Версия: Firebase 9+ Modular SDK
   
   ИНСТРУКЦИЯ ПО НАСТРОЙКЕ:
   
   1. Для использования с переменными окружения (Vite/Webpack):
      - Создайте файл .env на основе env.example
      - Заполните переменные VITE_FIREBASE_*
      - Используйте функцию getFirebaseConfig() (она читает import.meta.env)
      
   2. Для простого HTML (без сборщика):
      - Обновите функцию getFirebaseConfig() в этом файле
      - Замените "YOUR_API_KEY_HERE" на реальные значения из Firebase Console
      - Или подключите Firebase через CDN в index.html:
        <script type="module">
          import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
          import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
          // ... инициализация
        </script>
   
   3. Инициализация в script.js:
      await FirebaseService.init();
   
   Подробнее: см. FIREBASE_SETUP.md
   ============================================ */

// Глобальные переменные для Firebase
let firebaseApp = null;
let firebaseDb = null;
let firebaseAuth = null;
let firebaseInitialized = false;

/* ============================================
   Получение конфигурации Firebase из переменных окружения
   ============================================ */
function getFirebaseConfig() {
    // Вариант 1: Использование переменных окружения (для Vite/Webpack)
    // Если используется сборщик, переменные доступны через import.meta.env
    if (typeof import !== 'undefined' && import.meta && import.meta.env) {
        const env = import.meta.env;
        return {
            apiKey: env.VITE_FIREBASE_API_KEY,
            authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: env.VITE_FIREBASE_APP_ID
        };
    }
    
    // Вариант 2: Прямая конфигурация (для простых HTML страниц)
    // Замените значения на свои из Firebase Console
    return {
        apiKey: "YOUR_API_KEY_HERE",
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT_ID.appspot.com",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };
}

/* ============================================
   Инициализация Firebase
   ============================================ */
async function initFirebase() {
    if (firebaseInitialized) {
        console.log('✅ Firebase уже инициализирован');
        return { app: firebaseApp, db: firebaseDb, auth: firebaseAuth };
    }

    try {
        console.log('🔥 Инициализация Firebase...');
        
        const firebaseConfig = getFirebaseConfig();

        // Проверка наличия обязательных параметров
        if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY_HERE') {
            console.warn('⚠️ Firebase не настроен. Используйте переменные окружения или обновите конфигурацию.');
            console.warn('📝 Обновите функцию getFirebaseConfig() в firebase-config.js с вашими данными из Firebase Console');
            return null;
        }

        // Вариант 1: Если Firebase уже загружен через CDN или модули
        if (typeof window.firebase !== 'undefined' && window.firebase.initializeApp) {
            // Старая версия Firebase через CDN
            firebaseApp = window.firebase.initializeApp(firebaseConfig);
            firebaseDb = firebaseApp.firestore();
            firebaseAuth = firebaseApp.auth();
        } else {
            // Вариант 2: Динамический импорт модулей (для современных браузеров)
            try {
                const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
                const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

                firebaseApp = initializeApp(firebaseConfig);
                firebaseDb = getFirestore(firebaseApp);
                firebaseAuth = getAuth(firebaseApp);
            } catch (importError) {
                console.error('❌ Ошибка загрузки Firebase модулей:', importError);
                console.warn('💡 Подключите Firebase через CDN в index.html или используйте сборщик (Vite/Webpack)');
                return null;
            }
        }

        firebaseInitialized = true;
        
        console.log('✅ Firebase успешно инициализирован');
        console.log('📊 Project ID:', firebaseConfig.projectId);

        // Экспорт для глобального доступа
        window.firebaseApp = firebaseApp;
        window.firebaseDb = firebaseDb;
        window.firebaseAuth = firebaseAuth;

        return { app: firebaseApp, db: firebaseDb, auth: firebaseAuth };

    } catch (error) {
        console.error('❌ Ошибка инициализации Firebase:', error);
        return null;
    }
}


/* ============================================
   Сервис для работы с Firebase
   ============================================ */
const FirebaseService = {
    /* ============================================
       Инициализация (вызовите перед использованием)
       ============================================ */
    async init() {
        return await initFirebase();
    },

    /* ============================================
       Проверка инициализации
       ============================================ */
    isInitialized() {
        return firebaseInitialized && firebaseDb !== null;
    },

    /* ============================================
       Сохранение прогресса пользователя
       ============================================ */
    async saveUserProgress(userId, userData) {
        try {
            if (!this.isInitialized()) {
                console.warn('⚠️ Firebase не инициализирован');
                return { success: false, error: 'Firebase not initialized' };
            }

            console.log('💾 Сохранение прогресса пользователя:', userId);

            // Проверка версии Firebase API
            if (typeof firebaseDb.collection === 'function') {
                // Старая версия Firebase (v8)
                const userRef = firebaseDb.collection('users').doc(userId.toString());
                const dataToSave = {
                    ...userData,
                    userId: userId.toString(),
                    lastUpdated: window.firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: new Date().toISOString()
                };
                await userRef.set(dataToSave, { merge: true });
            } else {
                // Новая версия Firebase (v9+)
                const { doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                const userRef = doc(firebaseDb, 'users', userId.toString());
                const dataToSave = {
                    ...userData,
                    userId: userId.toString(),
                    lastUpdated: serverTimestamp(),
                    updatedAt: new Date().toISOString()
                };
                await setDoc(userRef, dataToSave, { merge: true });
            }

            console.log('✅ Прогресс пользователя сохранен');
            return { success: true };

        } catch (error) {
            console.error('❌ Ошибка сохранения прогресса:', error);
            return { success: false, error: error.message };
        }
    },

    /* ============================================
       Получение данных пользователя
       ============================================ */
    async getUserData(userId) {
        try {
            if (!this.isInitialized()) {
                console.warn('⚠️ Firebase не инициализирован');
                return null;
            }

            console.log('📂 Загрузка данных пользователя:', userId);

            let userData = null;

            // Проверка версии Firebase API
            if (typeof firebaseDb.collection === 'function') {
                // Старая версия Firebase (v8)
                const userDoc = await firebaseDb.collection('users').doc(userId.toString()).get();
                if (userDoc.exists) {
                    userData = userDoc.data();
                }
            } else {
                // Новая версия Firebase (v9+)
                const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                const userRef = doc(firebaseDb, 'users', userId.toString());
                const userSnap = await getDoc(userRef);
                
                if (userSnap.exists()) {
                    userData = userSnap.data();
                }
            }

            if (userData) {
                console.log('✅ Данные пользователя загружены');
                return userData;
            } else {
                console.log('ℹ️ Пользователь не найден в базе данных');
                return null;
            }

        } catch (error) {
            console.error('❌ Ошибка загрузки данных пользователя:', error);
            return null;
        }
    },

    /* ============================================
       Регистрация реферала
       ============================================ */
    async registerReferral(referralCode, newUserId, newUserData = {}) {
        try {
            if (!this.isInitialized()) {
                console.warn('⚠️ Firebase не инициализирован');
                return { success: false, error: 'Firebase not initialized' };
            }

            console.log('🔗 Регистрация реферала:', { referralCode, newUserId });

            // Используем Firebase v9+ модули (динамический импорт)
            const { 
                doc, 
                getDoc, 
                setDoc, 
                updateDoc, 
                increment, 
                arrayUnion,
                serverTimestamp 
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            // Поиск пользователя-реферера по реферальному коду
            const referralRef = doc(firebaseDb, 'referrals', referralCode);
            const referralSnap = await getDoc(referralRef);

            if (!referralSnap.exists()) {
                console.log('ℹ️ Реферальный код не найден');
                return { success: false, error: 'Referral code not found' };
            }

            const referralData = referralSnap.data();
            const referrerUserId = referralData.userId;

            // Проверка, что пользователь не приглашает сам себя
            if (referrerUserId === newUserId.toString()) {
                console.log('ℹ️ Пользователь пытается использовать собственный реферальный код');
                return { success: false, error: 'Cannot use own referral code' };
            }

            // Обновление статистики реферера
            const referrerUserRef = doc(firebaseDb, 'users', referrerUserId);
            await updateDoc(referrerUserRef, {
                referralsCount: increment(1),
                referralBonus: increment(1), // +1% за каждого реферала
                lastUpdated: serverTimestamp()
            });

            // Обновление списка рефералов реферера
            await updateDoc(referralRef, {
                referrals: arrayUnion(newUserId.toString()),
                referralsCount: increment(1),
                lastUpdated: serverTimestamp()
            });

            // Сохранение информации о новом пользователе (кто его пригласил)
            const newUserRef = doc(firebaseDb, 'users', newUserId.toString());
            await setDoc(newUserRef, {
                ...newUserData,
                referredBy: referralCode,
                referrerUserId: referrerUserId,
                referredAt: serverTimestamp(),
                createdAt: serverTimestamp()
            }, { merge: true });

            console.log('✅ Реферал успешно зарегистрирован');
            return { 
                success: true, 
                referrerUserId: referrerUserId 
            };

        } catch (error) {
            console.error('❌ Ошибка регистрации реферала:', error);
            return { success: false, error: error.message };
        }
    },

    /* ============================================
       Получение статистики рефералов
       ============================================ */
    async getReferralStats(userId) {
        try {
            if (!this.isInitialized()) {
                console.warn('⚠️ Firebase не инициализирован');
                return { referralsCount: 0, referralBonus: 0 };
            }

            console.log('📊 Загрузка статистики рефералов:', userId);

            let userData = null;
            
            if (typeof firebaseDb.collection === 'function') {
                // Старая версия Firebase (v8)
                const userDoc = await firebaseDb.collection('users').doc(userId.toString()).get();
                if (userDoc.exists) {
                    userData = userDoc.data();
                }
            } else {
                // Новая версия Firebase (v9+)
                const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                const userRef = doc(firebaseDb, 'users', userId.toString());
                const userSnap = await getDoc(userRef);
                
                if (userSnap.exists()) {
                    userData = userSnap.data();
                }
            }
            
            if (userData) {
                return {
                    referralsCount: userData.referralsCount || 0,
                    referralBonus: userData.referralBonus || 0,
                    referrals: userData.referrals || []
                };
            }

            return { referralsCount: 0, referralBonus: 0, referrals: [] };

        } catch (error) {
            console.error('❌ Ошибка получения статистики рефералов:', error);
            return { referralsCount: 0, referralBonus: 0, referrals: [] };
        }
    },

    /* ============================================
       Сохранение реферального кода пользователя
       ============================================ */
    async saveReferralCode(userId, referralCode) {
        try {
            if (!this.isInitialized()) {
                console.warn('⚠️ Firebase не инициализирован');
                return { success: false };
            }

            console.log('💾 Сохранение реферального кода:', { userId, referralCode });

            if (typeof firebaseDb.collection === 'function') {
                // Старая версия Firebase (v8)
                const FieldValue = window.firebase.firestore.FieldValue;
                await firebaseDb.collection('referrals').doc(referralCode).set({
                    userId: userId.toString(),
                    referralCode: referralCode,
                    createdAt: FieldValue.serverTimestamp(),
                    referrals: [],
                    referralsCount: 0
                }, { merge: true });
                
                await firebaseDb.collection('users').doc(userId.toString()).set({
                    referralCode: referralCode,
                    lastUpdated: FieldValue.serverTimestamp()
                }, { merge: true });
            } else {
                // Новая версия Firebase (v9+)
                const { doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                
                const referralRef = doc(firebaseDb, 'referrals', referralCode);
                await setDoc(referralRef, {
                    userId: userId.toString(),
                    referralCode: referralCode,
                    createdAt: serverTimestamp(),
                    referrals: [],
                    referralsCount: 0
                }, { merge: true });

                const userRef = doc(firebaseDb, 'users', userId.toString());
                await setDoc(userRef, {
                    referralCode: referralCode,
                    lastUpdated: serverTimestamp()
                }, { merge: true });
            }

            console.log('✅ Реферальный код сохранен');
            return { success: true };

        } catch (error) {
            console.error('❌ Ошибка сохранения реферального кода:', error);
            return { success: false, error: error.message };
        }
    },

    /* ============================================
       Получение топ игроков
       ============================================ */
    async getTopPlayers(limit = 10, sortBy = 'coins') {
        try {
            if (!this.isInitialized()) {
                console.warn('⚠️ Firebase не инициализирован');
                return [];
            }

            console.log(`🏆 Загрузка топ ${limit} игроков по ${sortBy}...`);

            let topPlayers = [];
            
            if (typeof firebaseDb.collection === 'function') {
                // Старая версия Firebase (v8)
                const querySnapshot = await firebaseDb
                    .collection('users')
                    .orderBy(sortBy, 'desc')
                    .limit(limit)
                    .get();
                
                topPlayers = querySnapshot.docs.map((doc, index) => ({
                    rank: index + 1,
                    id: doc.id,
                    ...doc.data()
                }));
            } else {
                // Новая версия Firebase (v9+)
                const { 
                    collection, 
                    query, 
                    orderBy, 
                    limit: limitFn, 
                    getDocs 
                } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

                const usersRef = collection(firebaseDb, 'users');
                const q = query(
                    usersRef, 
                    orderBy(sortBy, 'desc'), 
                    limitFn(limit)
                );

                const querySnapshot = await getDocs(q);
                topPlayers = querySnapshot.docs.map((doc, index) => ({
                    rank: index + 1,
                    id: doc.id,
                    ...doc.data()
                }));
            }

            console.log(`✅ Загружено ${topPlayers.length} игроков`);
            return topPlayers;

        } catch (error) {
            console.error('❌ Ошибка получения топ игроков:', error);
            
            // Если поле для сортировки не проиндексировано, пробуем другую сортировку
            if (sortBy !== 'totalTaps') {
                console.log('🔄 Попытка альтернативной сортировки...');
                return await this.getTopPlayers(limit, 'totalTaps');
            }
            
            return [];
        }
    },

    /* ============================================
       Получение позиции игрока в рейтинге
       ============================================ */
    async getUserRank(userId, sortBy = 'coins') {
        try {
            if (!this.isInitialized()) {
                console.warn('⚠️ Firebase не инициализирован');
                return null;
            }

            let rank = 0;
            
            if (typeof firebaseDb.collection === 'function') {
                // Старая версия Firebase (v8)
                const querySnapshot = await firebaseDb
                    .collection('users')
                    .orderBy(sortBy, 'desc')
                    .get();
                
                querySnapshot.docs.forEach((doc, index) => {
                    if (doc.id === userId.toString()) {
                        rank = index + 1;
                    }
                });
            } else {
                // Новая версия Firebase (v9+)
                const { 
                    collection, 
                    query, 
                    orderBy, 
                    getDocs 
                } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

                const usersRef = collection(firebaseDb, 'users');
                const q = query(usersRef, orderBy(sortBy, 'desc'));
                const querySnapshot = await getDocs(q);

                querySnapshot.docs.forEach((doc, index) => {
                    if (doc.id === userId.toString()) {
                        rank = index + 1;
                    }
                });
            }

            if (rank > 0) {
                console.log(`✅ Позиция игрока в рейтинге: ${rank}`);
                return rank;
            }

            return null;

        } catch (error) {
            console.error('❌ Ошибка получения позиции в рейтинге:', error);
            return null;
        }
    }
};

// Экспорт для использования в других файлах
window.FirebaseService = FirebaseService;

// Автоматическая инициализация при загрузке (опционально)
// Раскомментируйте, если хотите автоматическую инициализацию
// document.addEventListener('DOMContentLoaded', async () => {
//     await FirebaseService.init();
// });

console.log('🔥 Firebase Service загружен. Используйте FirebaseService.init() для инициализации.');
