/**
 * Скрипт для создания PNG иконок из SVG
 * 
 * ТРЕБОВАНИЯ:
 * - Node.js установлен
 * - Установите зависимости: npm install sharp
 * 
 * ИСПОЛЬЗОВАНИЕ:
 * node create-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createIcons() {
    console.log('🎨 Создание иконок для приложения "Тапалка"...\n');

    const sizes = [
        { size: 192, file: 'icon-192x192.png' },
        { size: 512, file: 'icon-512x512.png' }
    ];

    for (const { size, file } of sizes) {
        try {
            // Создаем SVG программно
            const svg = `
                <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.125}"/>
                    <text x="50%" y="50%" font-size="${size * 0.6}" text-anchor="middle" dominant-baseline="central" fill="white">🎮</text>
                </svg>
            `;

            // Конвертируем SVG в PNG
            const buffer = Buffer.from(svg);
            await sharp(buffer)
                .resize(size, size)
                .png()
                .toFile(file);

            console.log(`✅ Создана иконка: ${file} (${size}x${size})`);
        } catch (error) {
            console.error(`❌ Ошибка при создании ${file}:`, error.message);
        }
    }

    console.log('\n✨ Готово! Иконки созданы в корневой директории проекта.');
    console.log('📝 Убедитесь, что файлы находятся в той же папке, что и manifest.json');
}

// Проверка наличия sharp
try {
    require.resolve('sharp');
    createIcons().catch(console.error);
} catch (error) {
    console.error('❌ Модуль "sharp" не найден!');
    console.log('\n📦 Установите зависимости:');
    console.log('   npm install sharp');
    console.log('\n💡 Или используйте generate-icons.html в браузере для создания иконок.');
}
