# Руководство по оптимизации и сборке для продакшена

## Содержание
1. [Минификация CSS и JS](#минификация-css-и-js)
2. [Сборка проекта](#сборка-проекта)
3. [Оптимизация изображений](#оптимизация-изображений)
4. [Кеширование ресурсов](#кеширование-ресурсов)
5. [PWA оптимизация](#pwa-оптимизация)

---

## Минификация CSS и JS

### Автоматическая минификация

```bash
# Установка инструментов (только первый раз)
npm install -g cssnano-cli terser

# Минификация файлов
npm run minify
# или
node minify.js
```

Это создаст:
- `style.min.css` - минифицированная версия CSS
- `script.min.js` - минифицированная версия JS
- `firebase-config.min.js` - минифицированная версия Firebase конфига

### Ручная минификация

```bash
# CSS
cssnano style.css style.min.css

# JavaScript
terser script.js -o script.min.js -c -m --comments false

# Firebase config
terser firebase-config.js -o firebase-config.min.js -c -m --comments false
```

### Использование минифицированных файлов

После минификации обновите `index.html`:

```html
<!-- Вместо -->
<link rel="stylesheet" href="style.css">
<script src="script.js"></script>
<script src="firebase-config.js"></script>

<!-- Используйте -->
<link rel="stylesheet" href="style.min.css">
<script src="script.min.js"></script>
<script src="firebase-config.min.js"></script>
```

**Или используйте скрипт сборки** (автоматически обновит):

```bash
npm run build
```

---

## Сборка проекта

### Автоматическая сборка

```bash
npm run build
# или
node build.js
```

Это создаст папку `dist/` с оптимизированными файлами:
- Минифицированные CSS и JS (если доступны)
- Оптимизированный `index.html`
- Все необходимые файлы для деплоя

### Ручная сборка

1. Создайте папку `dist/`
2. Скопируйте файлы:
   - `index.html`
   - `manifest.json`
   - `icon-*.png`
   - `sw.js`
   - Минифицированные CSS/JS (или оригинальные)
3. Обновите пути в `index.html`

---

## Оптимизация изображений

### Иконки

Используйте оптимизированные PNG:

```bash
# С помощью ImageMagick
convert icon-192x192.png -strip -quality 85 icon-192x192-optimized.png
convert icon-512x512.png -strip -quality 85 icon-512x512-optimized.png

# Или используйте онлайн-инструменты:
# - TinyPNG (https://tinypng.com)
# - Squoosh (https://squoosh.app)
# - ImageOptim (https://imageoptim.com)
```

### WebP формат (опционально)

Для лучшей оптимизации используйте WebP:

```bash
# Конвертация в WebP
cwebp icon-192x192.png -q 85 -o icon-192x192.webp
cwebp icon-512x512.png -q 85 -o icon-512x512.webp
```

---

## Кеширование ресурсов

### Service Worker

Service Worker (`sw.js`) уже настроен для кеширования:
- **Static assets**: Cache First (CSS, JS, изображения)
- **API requests**: Network First (Firebase запросы)
- **HTML**: Network First с fallback на кеш

### HTTP Headers

Настройте заголовки на сервере для кеширования:

**Nginx:**
```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.(html|json)$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

**Apache (.htaccess):**
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType text/html "access plus 1 hour"
</IfModule>
```

---

## PWA оптимизация

### Проверка PWA

1. Откройте DevTools (F12)
2. Application → Manifest
3. Проверьте:
   - ✅ Manifest загружается
   - ✅ Иконки доступны
   - ✅ Service Worker регистрируется

### Lighthouse аудит

```bash
# Установка Lighthouse CLI
npm install -g lighthouse

# Проверка приложения
lighthouse https://your-domain.com --view
```

Целевые показатели:
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **PWA**: 90+

---

## Дополнительные оптимизации

### Lazy Loading изображений

```html
<img src="icon.png" loading="lazy" alt="Icon">
```

### Preconnect для внешних ресурсов

```html
<link rel="preconnect" href="https://telegram.org">
<link rel="preconnect" href="https://www.gstatic.com">
```

### Gzip/Brotli сжатие

Настройте сжатие на сервере для текстовых файлов (HTML, CSS, JS).

---

## Чеклист оптимизации

- [ ] CSS минифицирован
- [ ] JS минифицирован
- [ ] Изображения оптимизированы
- [ ] Service Worker работает
- [ ] Кеширование настроено
- [ ] Gzip/Brotli включено
- [ ] Lighthouse аудит пройден
- [ ] Тестирование выполнено

---

## Размер файлов (целевые показатели)

После оптимизации:
- `style.min.css`: < 50 KB
- `script.min.js`: < 150 KB
- `firebase-config.min.js`: < 20 KB
- `index.html`: < 20 KB
- `icon-192x192.png`: < 20 KB
- `icon-512x512.png`: < 50 KB

**Общий размер**: < 300 KB (без учета Firebase SDK)

---

## Производительность

### Метрики

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Total Blocking Time (TBT)**: < 200ms

### Оптимизация загрузки

1. Минифицируйте все ресурсы
2. Используйте HTTP/2
3. Включите кеширование
4. Оптимизируйте изображения
5. Используйте CDN для статических файлов

---

## Деплой оптимизированной версии

### Вариант 1: Использование dist/

```bash
# Сборка
npm run build

# Деплой папки dist/
# GitHub Pages: скопируйте dist/ в docs/ или root
# Netlify: укажите dist/ как publish directory
# Vercel: укажите dist/ как output directory
```

### Вариант 2: Обновление файлов напрямую

```bash
# Минификация
npm run minify

# Обновление index.html вручную
# Деплой всех файлов
```

---

## Мониторинг

### Аналитика

Используйте Яндекс.Метрику или Google Analytics для отслеживания:
- Время загрузки
- Ошибки загрузки
- Производительность

### Ошибки

Настройте мониторинг ошибок:
- Sentry
- Rollbar
- Firebase Crashlytics

---

## Дополнительные ресурсы

- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
