// Единый хелпер для внутренних ссылок с учётом base (/profistatus на GitHub Pages).
// Важно: import.meta.env.BASE_URL в Astro НЕ гарантирует слэш на конце,
// поэтому склеивать `${BASE_URL}page` напрямую нельзя — получится /profistatuspage (404).
// Все ссылки в проекте строим только через link() / basePath.

const rawBase: string = import.meta.env.BASE_URL ?? '/';

/** Базовый путь со слэшем на конце, например '/profistatus/' (локально '/'). */
export const basePath: string = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

/** Внутренняя ссылка: link('freelancers') -> '/profistatus/freelancers' */
export function link(path: string): string {
  return `${basePath}${path.replace(/^\//, '')}`;
}

/** Абсолютный canonical URL с учётом base, например '.../profistatus/app/receipts' */
export function canonicalUrl(path = '/'): string {
  const origin: string = (import.meta.env.SITE ?? 'https://superpirov.github.io').replace(/\/$/, '');
  const base = basePath.replace(/^\//, '');
  return `${origin}/${base}${path.replace(/^\//, '')}`;
}
