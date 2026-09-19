// Паттерн Repository (п. 4.1 ТЗ): UI зависит только от интерфейсов,
// а конкретная реализация (мок / REST / Airtable) подменяется в одном месте.
// Это позволит мигрировать на бэкенд за ~2 недели без переписывания страниц.

export interface Order {
  id: string;
  title: string;
  category: string;
  budget: number;
  city: string;
  postedAt: string;
  description: string;
}

export interface Receipt {
  id: string;
  amount: number;
  client: string;
  service: string;
  date: string;
  status: 'paid' | 'pending';
}

export interface IOrdersRepository {
  list(): Promise<Order[]>;
}

export interface IReceiptsRepository {
  list(): Promise<Receipt[]>;
}
