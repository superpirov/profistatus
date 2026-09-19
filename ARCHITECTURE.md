# ARCHITECTURE.md — архитектура ProfiStatus

## Принципы (п. 4.1 ТЗ)

1. **SSG-first**: все страницы пререндерятся в `dist/`. Нет серверного кода.
2. **Repository-паттерн**: UI зависит от интерфейсов (`src/lib/repositories.ts`),
   реализация — в `src/lib/mockRepositories.ts`. Замена на HTTP — в одном файле.
3. **Изоляция интеграций**: Formspree (`leadService.ts`), аналитика (`analytics.ts`),
   конфиг (`env.ts`). Компоненты не знают деталей провайдеров.
4. **Env-конфигурация**: все ключи через `import.meta.env`, пример — `.env.example`.

## Потоки данных

- **Лид**: `LeadForm.astro` → `submitLead()` → `POST Formspree` (или mock-лог).
- **Заказы**: `demo/orders` → `repositories.orders.list()` → `orders.json`.
- **Чеки**: `demo/freelancer` → `repositories.receipts.list()` → мок-массив.
- **Аналитика**: `track(event)` → PostHog / Метрика / console (graceful degradation).

## Точки расширения для бэкенда

| Сейчас (мок) | Позже (бэкенд) | Что менять |
|---|---|---|
| `MockOrdersRepository` | `HttpOrdersRepository` (REST `/api/orders`) | 1 класс + фабрика |
| `MockReceiptsRepository` | `HttpReceiptsRepository` | 1 класс |
| `submitLead` → Formspree | `POST /api/leads` | 1 функция |
| `orders.json` | БД (Postgres) | удалить файл |
| feature flag захардкожен | PostHog flags | `analytics.ts` |

## Производительность и a11y

- Нулевой JS по умолчанию (Astro islands): интерактив только в формах/калькуляторе.
- Tailwind v4 через Vite-плагин, бандл — только утилиты, использованные в коде.
- Семантика: `<main>`, skip-link, `aria-live` в формах, контраст ≥ 4.5:1.
