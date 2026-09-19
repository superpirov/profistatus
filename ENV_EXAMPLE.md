# ENV_EXAMPLE.md — переменные окружения

| Переменная | Куда попадает | Обязательна | Описание |
|---|---|---|---|
| `PUBLIC_FORMSPREE_ENDPOINT` | клиент | да (для лидов) | URL формы Formspree, `https://formspree.io/f/XXXX`. Без него — mock-режим с логом в console |
| `PUBLIC_POSTHOG_KEY` | клиент | нет | Ключ PostHog; пусто = события только в console |
| `PUBLIC_POSTHOG_HOST` | клиент | нет | По умолчанию `https://app.posthog.com` |
| `PUBLIC_YANDEX_METRICA_ID` | клиент | нет | ID счётчика Метрики |
| `SITE` | билд | нет | Канонический URL, по умолчанию github.io/profistatus |

В CI значения берутся из GitHub Secrets (`FORMSPREE_ENDPOINT`, `POSTHOG_KEY`,
`YANDEX_METRICA_ID`). Локально — скопируйте `.env.example` в `.env`.
