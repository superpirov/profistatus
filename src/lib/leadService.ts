// Отправка лидов через Formspree (Backend-as-a-Service, п. 3.3 ТЗ).
// Форма работает без собственного бэкенда: обычный POST JSON по HTTPS.
import { env } from './env';

export interface LeadPayload {
  name: string;
  contact: string;
  segment: 'freelancer' | 'business' | 'feedback';
  comment?: string;
}

export async function submitLead(payload: LeadPayload): Promise<boolean> {
  // Заглушка: если endpoint не настроен — эмулируем успех и логируем.
  if (env.formspreeEndpoint.includes('XXXX')) {
    console.info('[ProfiStatus] Formspree не настроен, лид залогирован локально:', payload);
    await new Promise((r) => setTimeout(r, 600));
    return true;
  }
  const res = await fetch(env.formspreeEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...payload, _subject: `ProfiStatus: ${payload.segment}` }),
  });
  return res.ok;
}
