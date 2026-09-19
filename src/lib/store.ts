// Рабочее локальное хранилище ProfiStatus (без бэкенда данные живут в localStorage браузера).
//
// Что это даёт уже сейчас (реально работает):
// - генератор чеков: валидация, нумерация, расчёт налога 4%/6%, история, печать, экспорт JSON;
// - биржа заказов: публикация заказов, фильтры, отклики, удаление своих.
//
// Чего НЕ хватает без бэкенда (нужны данные/интеграции от заказчика):
// - общая база между пользователями (сейчас каждый видит только своё + витрину-сид);
// - фискализация чеков в ФНС (сейчас формируется ПРЕДЧЕК — не fiscal document);
// - проверка статуса самозанятого, выплаты, автодоговоры.
//
// Миграция: заменить функции этого модуля на HTTP-репозитории с теми же
// интерфейсами из repositories.ts — UI страниц при этом не меняется.
import seedOrders from '@/data/orders.json';
import type { Order } from './repositories';

export type ClientType = 'individual' | 'company';

export interface ReceiptRecord {
  id: string;
  number: number; // сквозной номер чека
  service: string;
  client: string;
  clientType: ClientType;
  amount: number;
  tax: number; // расчётный налог: 4% физлица, 6% юрлица/ИП
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO
}

export interface OrderRecord extends Order {
  contact: string;
  mine: boolean; // опубликован из этого браузера
  responses: number; // число откликов
}

const KEYS = {
  receipts: 'profistatus:receipts:v1',
  orders: 'profistatus:orders:v1',
  responses: 'profistatus:order-responses:v1', // отклики на чужие/сид-заказы: { [id]: count }
  responded: 'profistatus:order-responded:v1', // на что я уже откликнулся: string[]
  counter: 'profistatus:receipt-counter:v1',
  profile: 'profistatus:pay-profile:v1', // реквизиты самозанятого для QR-оплаты
  invoices: 'profistatus:invoices:v1', // выставленные счета с QR
} as const;

/** Годовой лимит дохода самозанятого по 422-ФЗ, ₽ */
export const YEAR_LIMIT = 2_400_000;

export const ORDER_CATEGORIES = [
  'Дизайн',
  'Разработка',
  'Копирайтинг',
  'Маркетинг',
  'Фото',
  'Аудио',
  'Переводы',
  'Аналитика',
  'Юриспруденция',
  'Другое',
] as const;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* переполненное/недоступное хранилище не должно ломать UX */
  }
}

export const fmtMoney = (n: number): string => `${Math.round(n).toLocaleString('ru-RU')} ₽`;

export const fmtDate = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString('ru-RU');
};

export const todayIso = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Расчёт налога НПД: 4% — поступления от физлиц, 6% — от юрлиц и ИП. */
export function calcTax(amount: number, clientType: ClientType): number {
  return Math.round(amount * (clientType === 'company' ? 0.06 : 0.04));
}

// ---------- Чеки ----------

export function getReceipts(): ReceiptRecord[] {
  return load<ReceiptRecord[]>(KEYS.receipts, []).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

export interface ReceiptInput {
  service: string;
  client: string;
  clientType: ClientType;
  amount: number;
  date: string;
}

/** Проверка чека по правилам самозанятости. Возвращает список ошибок (пусто = ок). */
export function validateReceipt(input: ReceiptInput): string[] {
  const errors: string[] = [];
  if (!input.service.trim()) errors.push('Укажите услугу или товар.');
  if (!input.client.trim()) errors.push('Укажите клиента.');
  if (!Number.isFinite(input.amount) || input.amount <= 0)
    errors.push('Сумма должна быть больше нуля.');
  if (input.amount > 10_000_000) errors.push('Сумма выглядит нереалистично — проверьте нули.');
  if (!input.date) errors.push('Укажите дату.');
  else if (input.date > todayIso()) errors.push('Дата не может быть в будущем.');
  // Предупреждение о годовом лимите 2,4 млн ₽
  const year = Number(input.date.slice(0, 4));
  if (input.date && year) {
    const total = yearTotal(year) + (Number.isFinite(input.amount) ? input.amount : 0);
    if (total > YEAR_LIMIT)
      errors.push(
        `Превышен годовой лимит самозанятого (2,4 млн ₽): итого за ${year} год будет ${fmtMoney(total)}.`,
      );
  }
  return errors;
}

export function addReceipt(input: ReceiptInput): ReceiptRecord {
  const counter = load<number>(KEYS.counter, 0) + 1;
  save(KEYS.counter, counter);
  const record: ReceiptRecord = {
    id: `r-${Date.now().toString(36)}-${counter}`,
    number: counter,
    service: input.service.trim(),
    client: input.client.trim(),
    clientType: input.clientType,
    amount: Math.round(input.amount),
    tax: calcTax(Math.round(input.amount), input.clientType),
    date: input.date,
    createdAt: new Date().toISOString(),
  };
  const all = getReceipts();
  all.push(record);
  save(KEYS.receipts, all);
  return record;
}

export function removeReceipt(id: string): void {
  save(
    KEYS.receipts,
    getReceipts().filter((r) => r.id !== id),
  );
}

export function yearTotal(year: number): number {
  return getReceipts()
    .filter((r) => Number(r.date.slice(0, 4)) === year)
    .reduce((s, r) => s + r.amount, 0);
}

export function yearTax(year: number): number {
  return getReceipts()
    .filter((r) => Number(r.date.slice(0, 4)) === year)
    .reduce((s, r) => s + r.tax, 0);
}

/** Доход по месяцам за последние 6 месяцев — для графика дашборда. */
export function monthlyTotals(): { label: string; total: number }[] {
  const now = new Date();
  const months: { label: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const total = getReceipts()
      .filter((r) => r.date.startsWith(key))
      .reduce((s, r) => s + r.amount, 0);
    months.push({
      label: d.toLocaleDateString('ru-RU', { month: 'short' }),
      total,
    });
  }
  return months;
}

// ---------- Заказы ----------

function seedAsRecords(): OrderRecord[] {
  const overrides = load<Record<string, number>>(KEYS.responses, {});
  return (seedOrders as Order[]).map((o) => ({
    ...o,
    contact: '',
    mine: false,
    responses: overrides[o.id] ?? 0,
  }));
}

export function getCustomOrders(): OrderRecord[] {
  return load<OrderRecord[]>(KEYS.orders, []);
}

/** Вся витрина: сид + опубликованные из этого браузера. */
export function getOrders(): OrderRecord[] {
  return [...getCustomOrders(), ...seedAsRecords()].sort((a, b) =>
    b.postedAt.localeCompare(a.postedAt),
  );
}

export function getMyOrders(): OrderRecord[] {
  return getCustomOrders().sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

export interface OrderInput {
  title: string;
  category: string;
  budget: number;
  city: string;
  description: string;
  contact: string;
}

export function validateOrder(input: OrderInput): string[] {
  const errors: string[] = [];
  if (!input.title.trim()) errors.push('Укажите название задачи.');
  if (!input.category) errors.push('Выберите категорию.');
  if (!Number.isFinite(input.budget) || input.budget <= 0)
    errors.push('Укажите бюджет больше нуля.');
  if (!input.city.trim()) errors.push('Укажите город или «Удалённо».');
  if (!input.description.trim()) errors.push('Опишите задачу — так откликов будет больше.');
  if (!input.contact.trim()) errors.push('Укажите контакт для связи.');
  return errors;
}

export function addOrder(input: OrderInput): OrderRecord {
  const record: OrderRecord = {
    id: `my-${Date.now().toString(36)}`,
    title: input.title.trim(),
    category: input.category,
    budget: Math.round(input.budget),
    city: input.city.trim(),
    description: input.description.trim(),
    contact: input.contact.trim(),
    postedAt: todayIso(),
    mine: true,
    responses: 0,
  };
  const all = getCustomOrders();
  all.push(record);
  save(KEYS.orders, all);
  return record;
}

export function removeOrder(id: string): void {
  save(
    KEYS.orders,
    getCustomOrders().filter((o) => o.id !== id),
  );
}

/** Отклик на заказ. Возвращает true, если это первый отклик пользователя. */
export function respondToOrder(id: string): boolean {
  const responded = load<string[]>(KEYS.responded, []);
  if (responded.includes(id)) return false;
  responded.push(id);
  save(KEYS.responded, responded);

  const custom = getCustomOrders();
  const mine = custom.find((o) => o.id === id);
  if (mine) {
    mine.responses += 1;
    save(KEYS.orders, custom);
  } else {
    const overrides = load<Record<string, number>>(KEYS.responses, {});
    overrides[id] = (overrides[id] ?? 0) + 1;
    save(KEYS.responses, overrides);
  }
  return true;
}

export function hasResponded(id: string): boolean {
  return load<string[]>(KEYS.responded, []).includes(id);
}

// ---------- Оплата по QR ----------
//
// Два режима QR:
// 1. «Настоящий» (sbp): самозанятый вставляет SBP-строку/QR из своего банка
//    (статический QR для приёма переводов). Клиент сканирует — открывается банк.
//    Динамические суммы в SBP без регистрации мерчанта невозможны — это задача бэкенда.
// 2. «Визитка» (details): QR с реквизитами и суммой текстом. Клиент сканирует,
//    копирует данные в свой банк и платит. Работает всегда, но в два касания.

export interface PayProfile {
  payee: string; // имя/название для счёта
  phone: string; // телефон для СБП-перевода
  bank: string; // банк получателя
  card: string; // номер карты (необязательно)
  sbpPayload: string; // SBP-строка из банка для настоящей оплаты (необязательно)
  qrImage: string; // фото/скрин QR из банка, dataURL (альтернатива строке)
}

export interface Invoice {
  id: string;
  client: string;
  amount: number;
  receiptId?: string;
  receiptNumber?: number;
  // Снапшот реквизитов на момент выставления — счёт не меняется при смене профиля
  payee: string;
  phone: string;
  bank: string;
  card: string;
  qrKind: 'sbp' | 'details' | 'image';
  qrText: string; // что именно закодировано в QR (для sbp/details)
  qrImage: string; // картинка QR из банка (для image), dataURL
  status: 'unpaid' | 'paid';
  createdAt: string; // ISO
  paidAt?: string; // ISO
}

export function getPayProfile(): PayProfile {
  return load<PayProfile>(KEYS.profile, { payee: '', phone: '', bank: '', card: '', sbpPayload: '', qrImage: '' });
}

export function savePayProfile(p: PayProfile): void {
  save(KEYS.profile, {
    payee: p.payee.trim(),
    phone: p.phone.trim(),
    bank: p.bank.trim(),
    card: p.card.trim(),
    sbpPayload: p.sbpPayload.trim(),
    qrImage: p.qrImage, // dataURL из input[type=file], не тримим содержимое
  });
}

/** Строит текст QR по текущему профилю. Настоящий SBP — только если вставлена строка из банка. */
export function buildQr(profile: PayProfile, client: string, amount: number): { kind: 'sbp' | 'details'; text: string } {
  if (profile.sbpPayload) return { kind: 'sbp', text: profile.sbpPayload };
  const lines = [
    'PROFISTATUS-PAY',
    `Получатель: ${profile.payee || '—'}`,
    `Сумма: ${fmtMoney(amount)}`,
    `Клиент: ${client}`,
    profile.phone ? `Телефон (СБП): ${profile.phone}` : '',
    profile.bank ? `Банк: ${profile.bank}` : '',
    profile.card ? `Карта: ${profile.card}` : '',
  ].filter(Boolean);
  return { kind: 'details', text: lines.join('\n') };
}

export function getInvoices(): Invoice[] {
  return load<Invoice[]>(KEYS.invoices, []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export interface InvoiceInput {
  client: string;
  amount: number;
  receiptId?: string;
  receiptNumber?: number;
}

export function validateInvoice(input: InvoiceInput): string[] {
  const errors: string[] = [];
  if (!input.client.trim()) errors.push('Укажите клиента.');
  if (!Number.isFinite(input.amount) || input.amount <= 0) errors.push('Сумма должна быть больше нуля.');
  const p = getPayProfile();
  if (!p.phone && !p.card && !p.sbpPayload && !p.qrImage)
    errors.push('Заполните реквизиты (телефон, карту, SBP-строку или фото QR) — иначе клиенту некуда платить.');
  return errors;
}

export function addInvoice(input: InvoiceInput): Invoice {
  const p = getPayProfile();
  // Приоритет: настоящая SBP-строка > фото QR из банка > текстовая визитка
  const kind: Invoice['qrKind'] = p.sbpPayload ? 'sbp' : p.qrImage ? 'image' : 'details';
  const qr = buildQr(p, input.client.trim(), Math.round(input.amount));
  const inv: Invoice = {
    id: `inv-${Date.now().toString(36)}`,
    client: input.client.trim(),
    amount: Math.round(input.amount),
    receiptId: input.receiptId,
    receiptNumber: input.receiptNumber,
    payee: p.payee.trim(),
    phone: p.phone.trim(),
    bank: p.bank.trim(),
    card: p.card.trim(),
    qrKind: kind,
    qrText: kind === 'image' ? '' : qr.text,
    qrImage: kind === 'image' ? p.qrImage : '',
    status: 'unpaid',
    createdAt: new Date().toISOString(),
  };
  const all = getInvoices();
  all.push(inv);
  save(KEYS.invoices, all);
  return inv;
}

/** Отметка об оплате — вручную (подтверждение от банка придёт с бэкендом/эквайрингом). */
export function markInvoicePaid(id: string): void {
  const all = getInvoices().map((inv) =>
    inv.id === id ? { ...inv, status: 'paid' as const, paidAt: new Date().toISOString() } : inv,
  );
  save(KEYS.invoices, all);
}

export function removeInvoice(id: string): void {
  save(
    KEYS.invoices,
    getInvoices().filter((inv) => inv.id !== id),
  );
}

export function unpaidTotal(): number {
  return getInvoices()
    .filter((inv) => inv.status === 'unpaid')
    .reduce((s, inv) => s + inv.amount, 0);
}
