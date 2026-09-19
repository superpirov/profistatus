# ProfiStatus — MVP-лендинг и прототип сервиса легализации самозанятых

Статический сайт на **Astro + Tailwind CSS v4**, хостинг — **GitHub Pages**
(`https://superpirov.github.io/profistatus`). Бэкенда нет: заявки идут через
Formspree, демо-кабинет — на моковых данных через Repository-паттерн.

## Быстрый старт

```bash
npm install
cp .env.example .env   # вставить PUBLIC_FORMSPREE_ENDPOINT
npm run dev            # http://localhost:4321/profistatus
npm run build          # статика в dist/
```

## Деплой

1. Включите GitHub Pages: Settings → Pages → Source = **GitHub Actions**.
2. Секреты (Settings → Secrets → Actions): `FORMSPREE_ENDPOINT`,
   `POSTHOG_KEY` (опционально), `YANDEX_METRICA_ID` (опционально).
3. Push в `master`/`main` — workflow `Deploy to GitHub Pages` соберёт и опубликует.

> Важно: `astro.config.mjs` содержит `base: '/profistatus'`. При переезде на
> кастомный домен замените `base` на `'/'` и `site` на домен, обновите
> `robots.txt` и канонические URL.

## Структура

- `src/pages/` — `/`, `/freelancers`, `/business`, `/how-it-works`, `/blog`, `/legal`
- `src/pages/app/` — **рабочий кабинет**: дашборд, генератор предчеков, биржа заказов, панель заказчика
- `src/pages/demo/*` — редиректы старых демо-ссылок на `/app/*`
- `src/components/` — `LeadForm`, `Calculator`
- `src/lib/` — `repositories.ts` (интерфейсы), `store.ts` (рабочее хранилище в localStorage),
  `site.ts` (ссылки с учётом base), `leadService.ts`, `analytics.ts`, `env.ts`
- `src/data/orders.json` — стартовая витрина биржи (12 заказов)
- `public/robots.txt`, `public/favicon.svg`

## Кабинет: что работает, а что ждёт данных

Работает локально (localStorage, без бэкенда): предчеки с налогом 4%/6% и контролем
лимита 2,4 млн ₽, печать и экспорт JSON, счета с QR-кодом для оплаты клиентом,
публикация заказов, фильтры, отклики, дашборд дохода с графиком.

Нужны данные от заказчика (помечено в интерфейсе бейджем «нужен бэкенд»):
`FORMSPREE_ENDPOINT` для заявок, ИНН/статус самозанятого + API «Мой налог» для
фискализации, SBP-мерчант/эквайринг для one-tap оплаты по QR и автоподтверждения
платежей, шаблон договора от юриста, платёжная интеграция для безопасной сделки.

См. также: `ARCHITECTURE.md`, `MIGRATION_GUIDE.md`, `ENV_EXAMPLE.md`.
