export interface Operation {
  _id: string;
  name: string;
  amount: number;
  date: Date;
  status: 'open' | 'paid';
  paid_at: Date | null;
  context: string;
  category: 'personal' | 'business';
}

export interface OperationTotals {
  open: number;
  paid: number;
  countOpen: number;
  countPaid: number;
}
