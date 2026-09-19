# MIGRATION_GUIDE.md — переезд с GitHub Pages на Next.js SSR + бэкенд

Оценка: **≤ 2 недель** при соблюдении Repository-паттерна.

## Неделя 1: фронт на Next.js

1. `npx create-next-app@latest` → перенести `src/components`, `src/lib` (заменить
   `import.meta.env` на `process.env.NEXT_PUBLIC_*`).
2. Страницы `.astro` → `app/*.tsx` (разметка 1:1, стили Tailwind те же).
3. `orders.json` оставить как fallback, добавить `fetch` с `revalidate`.
4. Поставить PostHog JS и Метрику как в `analytics.ts`.

## Неделя 2: бэкенд (Node.js + Postgres)

1. Эндпоинты: `POST /api/leads`, `GET /api/orders`, `GET/POST /api/receipts`.
2. Реализовать `HttpOrdersRepository` / `HttpReceiptsRepository`:
   ```ts
   export class HttpOrdersRepository implements IOrdersRepository {
     async list() { return (await fetch('/api/orders')).json(); }
   }
   ```
3. Переключить фабрику в `mockRepositories.ts` → `httpRepositories.ts` по флагу
   `NEXT_PUBLIC_USE_MOCK`.
4. Перенести лиды из Formspree/Airtable в БД (экспорт CSV → импорт).
5. DNS: кастомный домен → новый хостинг, `base` убрать, редиректы со старых URL.

## Чек-лист готовности

- [ ] Интерфейсы `IOrdersRepository` / `IReceiptsRepository` не менялись
- [ ] Секреты переехали в серверные env (не `NEXT_PUBLIC_*`)
- [ ] Формы шлют на `/api/leads`, Formspree отключён
- [ ] Lighthouse ≥ 90 после переезда
