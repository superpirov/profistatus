// Мок-реализация репозиториев для GitHub Pages (без бэкенда).
// При миграции заменить на HttpOrdersRepository, не трогая UI.
import ordersData from '@/data/orders.json';
import type { IOrdersRepository, IReceiptsRepository, Order, Receipt } from './repositories';

export class MockOrdersRepository implements IOrdersRepository {
  async list(): Promise<Order[]> {
    // Имитация задержки сети, чтобы демо выглядело реалистично
    await new Promise((r) => setTimeout(r, 150));
    return ordersData as Order[];
  }
}

const MOCK_RECEIPTS: Receipt[] = [
  { id: 'CHK-001', amount: 15000, client: 'ООО «Вектор»', service: 'Дизайн лендинга', date: '2026-09-10', status: 'paid' },
  { id: 'CHK-002', amount: 8000, client: 'ИП Смирнов', service: 'Верстка email', date: '2026-09-12', status: 'paid' },
  { id: 'CHK-003', amount: 25000, client: 'ООО «Альфа»', service: 'Разработка MVP', date: '2026-09-15', status: 'pending' },
];

export class MockReceiptsRepository implements IReceiptsRepository {
  async list(): Promise<Receipt[]> {
    await new Promise((r) => setTimeout(r, 150));
    return MOCK_RECEIPTS;
  }
}

// Фабрика: единая точка выбора реализации.
export const repositories = {
  orders: new MockOrdersRepository(),
  receipts: new MockReceiptsRepository(),
};
