// Продуктовая аналитика: PostHog (feature flags, воронки, A/B) + Яндекс.Метрика.
// Заглушки трекают события в console, пока ключи не заданы в .env.
import { env } from './env';

declare global {
  interface Window {
    posthog?: { capture: (e: string, p?: Record<string, unknown>) => void };
    ym?: (id: string | number, method: string, ...args: unknown[]) => void;
  }
}

export function track(event: string, props: Record<string, unknown> = {}) {
  try {
    if (typeof window !== 'undefined' && window.posthog) window.posthog.capture(event, props);
    if (typeof window !== 'undefined' && window.ym && env.yandexMetricaId)
      window.ym(env.yandexMetricaId, 'reachGoal', event, props);
    if (!env.posthogKey) console.debug('[analytics]', event, props);
  } catch {
    /* аналитика никогда не должна ломать UX */
  }
}
