/**
 * Скрипт сборки для продакшена
 * Создает оптимизированную версию приложения
 * 
 * Использование: node build.js
 */

const fs = require('fs');
const path = require('path');

console.log('🏗️  Сборка проекта для продакшена...\n');

// Создание папки dist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
    console.log('📁 Создана папка dist/');
}

// Файлы для копирования
const filesToCopy = [
    'index.html',
    'manifest.json',
    'icon-192x192.png',
    'icon-512x512.png',
    'sw.js'
];

// Минифицированные версии (если существуют)
const minifiedFiles = {
    'style.css': 'style.min.css',
    'script.js': 'script.min.js',
    'firebase-config.js': 'firebase-config.min.js'
};

// Копирование файлов
function copyFile(src, dest) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(src)) {
            console.warn(`⚠️  Файл не найден: ${src}`);
            resolve();
            return;
        }
        
        fs.copyFile(src, dest, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

// Обновление index.html для использования минифицированных файлов
function updateIndexHTML() {
    return new Promise((resolve, reject) => {
        try {
            let html = fs.readFileSync('index.html', 'utf8');
            
            // Замена на минифицированные версии
            if (fs.existsSync('style.min.css')) {
                html = html.replace(/href="style\.css"/g, 'href="style.min.css"');
                console.log('✅ Обновлен путь к style.min.css');
            }
            
            if (fs.existsSync('script.min.js')) {
                html = html.replace(/src="script\.js"/g, 'src="script.min.js"');
                console.log('✅ Обновлен путь к script.min.js');
            }
            
            if (fs.existsSync('firebase-config.min.js')) {
                html = html.replace(/src="firebase-config\.js"/g, 'src="firebase-config.min.js"');
                console.log('✅ Обновлен путь к firebase-config.min.js');
            }
            
            fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf8');
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

// Основная функция
async function build() {
    try {
        // Копирование файлов
        console.log('📋 Копирование файлов...');
        for (const file of filesToCopy) {
            if (fs.existsSync(file)) {
                await copyFile(file, path.join(distDir, file));
                console.log(`✅ Скопирован: ${file}`);
            }
        }
        
        // Копирование минифицированных или оригинальных файлов
        console.log('\n📋 Копирование стилей и скриптов...');
        for (const [original, minified] of Object.entries(minifiedFiles)) {
            const fileToCopy = fs.existsSync(minified) ? minified : original;
            if (fs.existsSync(fileToCopy)) {
                const destName = fs.existsSync(minified) ? original : original; // Используем оригинальное имя
                await copyFile(fileToCopy, path.join(distDir, destName));
                console.log(`✅ Скопирован: ${fileToCopy} → ${destName}`);
            }
        }
        
        // Обновление index.html
        console.log('\n📝 Обновление index.html...');
        await updateIndexHTML();
        
        // Создание .gitkeep для папки dist
        fs.writeFileSync(path.join(distDir, '.gitkeep'), '');
        
        console.log('\n✅ Сборка завершена!');
        console.log(`📦 Файлы готовы в папке: ${distDir}`);
        console.log('\n📋 Следующие шаги:');
        console.log('1. Проверьте файлы в папке dist/');
        console.log('2. Протестируйте приложение');
        console.log('3. Деплой папки dist/ на хостинг');
        
    } catch (error) {
        console.error('\n❌ Ошибка сборки:', error);
        process.exit(1);
    }
}

build();
