/**
 * Скрипт для минификации CSS и JS файлов
 * Требования: npm install cssnano-cli terser -g
 * 
 * Использование: node minify.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Минификация файлов для продакшена...\n');

// Проверка наличия инструментов
const checkTools = () => {
    return new Promise((resolve, reject) => {
        exec('which cssnano-cli terser', (error) => {
            if (error) {
                console.error('❌ Инструменты не установлены!');
                console.log('\n📦 Установите инструменты:');
                console.log('   npm install -g cssnano-cli terser');
                reject(error);
            } else {
                resolve();
            }
        });
    });
};

// Минификация CSS
const minifyCSS = () => {
    return new Promise((resolve, reject) => {
        console.log('📝 Минификация style.css...');
        
        exec('cssnano style.css style.min.css', (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Ошибка минификации CSS:', error);
                reject(error);
            } else {
                const originalSize = fs.statSync('style.css').size;
                const minifiedSize = fs.statSync('style.min.css').size;
                const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
                
                console.log(`✅ CSS минифицирован: ${formatBytes(originalSize)} → ${formatBytes(minifiedSize)} (${savings}% меньше)`);
                resolve();
            }
        });
    });
};

// Минификация JS
const minifyJS = () => {
    return new Promise((resolve, reject) => {
        console.log('📝 Минификация script.js...');
        
        const command = 'terser script.js -o script.min.js -c -m --comments false';
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Ошибка минификации JS:', error);
                reject(error);
            } else {
                const originalSize = fs.statSync('script.js').size;
                const minifiedSize = fs.statSync('script.min.js').size;
                const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
                
                console.log(`✅ JS минифицирован: ${originalSize} → ${minifiedSize} байт (${savings}% меньше)`);
                resolve();
            }
        });
    });
};

// Минификация firebase-config.js
const minifyFirebase = () => {
    return new Promise((resolve, reject) => {
        console.log('📝 Минификация firebase-config.js...');
        
        exec('terser firebase-config.js -o firebase-config.min.js -c -m --comments false', (error) => {
            if (error) {
                console.warn('⚠️ Ошибка минификации firebase-config.js:', error);
                resolve(); // Не критично
            } else {
                console.log('✅ firebase-config.js минифицирован');
                resolve();
            }
        });
    });
};

// Форматирование размера файла
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Основная функция
async function main() {
    try {
        await checkTools();
        
        await minifyCSS();
        await minifyJS();
        await minifyFirebase();
        
        console.log('\n✅ Минификация завершена!');
        console.log('\n📋 Следующие шаги:');
        console.log('1. Обновите index.html для использования .min.js и .min.css файлов');
        console.log('2. Протестируйте приложение');
        console.log('3. Деплой минифицированных файлов');
        
    } catch (error) {
        console.error('\n❌ Ошибка минификации:', error);
        process.exit(1);
    }
}

main();
