# ARCHITECTURE.md — архитектура ProfiStatus

## Принципы (п. 4.1 ТЗ)

1. **SSG-first**: все страницы пререндерятся в `dist/`. Нет серверного кода.
2. **Repository-паттерн**: UI зависит от интерфейсов (`src/lib/repositories.ts`),
   рабочая реализация — `src/lib/store.ts` на localStorage. Замена на HTTP — в одном файле.
3. **Изоляция интеграций**: Formspree (`leadService.ts`), аналитика (`analytics.ts`),
   конфиг (`env.ts`), ссылки (`site.ts` — единый `link()` с учётом base). Компоненты не знают деталей провайдеров.
4. **Env-конфигурация**: все ключи через `import.meta.env`, пример — `.env.example`.

## Потоки данных

- **Лид**: `LeadForm.astro` → `submitLead()` → `POST Formspree` (или mock-лог).
- **Чеки**: `app/receipts` → `store.ts` (валидация, нумерация, налог 4%/6%, localStorage) → история/печать/JSON.
- **Счета с QR**: `app/invoices` → `store.ts` (профиль реквизитов, снапшот в счёте) → QR генерируется
  клиентской библиотекой `qrcode`; настоящий SBP-QR — только из вставленной строки банка.
- **Заказы**: `app/orders` → `store.ts` (сид `orders.json` + публикации пользователя) → фильтры/отклики.
- **Дашборд**: `app/index` → агрегация `store.ts` (доход, налог, график SVG).
- **Аналитика**: `track(event)` → PostHog / Метрика / console (graceful degradation).

## Точки расширения для бэкенда

| Сейчас (локально) | Позже (бэкенд) | Что менять |
|---|---|---|
| `store.ts` → localStorage (заказы) | `HttpOrdersRepository` (REST `/api/orders`) | 1 модуль + фабрика |
| `store.ts` → localStorage (чеки) | `HttpReceiptsRepository` + фискализация ФНС | 1 модуль |
| `submitLead` → Formspree | `POST /api/leads` | 1 функция |
| сид `orders.json` | БД (Postgres) | удалить файл |
| фискализация — демо-заглушка | API «Мой налог» (ИНН, ключи) | новый модуль + секреты |
| уведомления — нет | Telegram/email-рассылка | новый модуль |

## Производительность и a11y

- Нулевой JS по умолчанию (Astro islands): интерактив только в формах/калькуляторе.
- Tailwind v4 через Vite-плагин, бандл — только утилиты, использованные в коде.
- Семантика: `<main>`, skip-link, `aria-live` в формах, контраст ≥ 4.5:1.
