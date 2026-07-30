import { Client } from './client.model';

export interface InvoiceLine {
  _id?: string;
  product_id: string;
  ref: string;
  designation: string;
  quantity: number;
  unit_price_ht: number;
  discount_pct: number;
  discount_amount: number;
  line_total_ht: number;
}

export interface Invoice {
  _id: string;
  numero: string;
  date: Date;
  client_id: string | Client;
  code_client: string;
  bl_number: string;
  payment_mode: string;
  payment_conditions: string;
  bank_name: string;
  bank_rib: string;
  type: 'proforma' | 'facture';
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  total_ht: number;
  tva_rate: number;
  tva_amount: number;
  total_ttc: number;
  notes: string;
}

export interface DashboardStats {
  totalInvoices: number;
  totalFacture: number;
  totalProforma: number;
  revenue: number;
  revenueFacture: number;
  revenueProforma: number;
}
