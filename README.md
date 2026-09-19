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

- `src/pages/` — `/`, `/freelancers`, `/business`, `/how-it-works`, `/blog`, `/legal`, `/demo/*`
- `src/components/` — `LeadForm`, `Calculator`, `DemoBanner`
- `src/lib/` — `repositories.ts` (интерфейсы), `mockRepositories.ts`, `leadService.ts`, `analytics.ts`, `env.ts`
- `src/data/orders.json` — 12 мок-заказов для витрины
- `public/robots.txt`, `public/favicon.svg`

См. также: `ARCHITECTURE.md`, `MIGRATION_GUIDE.md`, `ENV_EXAMPLE.md`.
