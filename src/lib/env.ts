// Централизованный доступ к переменным окружения.
// Все ключи PUBLIC_* попадают в клиентский бандл, остальные — только сервер/билд.
// Никаких секретов в клиентском коде (п. 4.3 ТЗ).
export const env = {
  siteUrl: import.meta.env.SITE ?? 'https://superpirov.github.io/profistatus',
  formspreeEndpoint:
    import.meta.env.PUBLIC_FORMSPREE_ENDPOINT ?? 'https://formspree.io/f/XXXXYYYY',
  posthogKey: import.meta.env.PUBLIC_POSTHOG_KEY ?? '',
  posthogHost: import.meta.env.PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
  yandexMetricaId: import.meta.env.PUBLIC_YANDEX_METRICA_ID ?? '',
  isProd: import.meta.env.PROD,
};
