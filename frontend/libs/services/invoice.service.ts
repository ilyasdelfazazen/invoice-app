import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice, InvoiceLine, DashboardStats } from '../models/invoice.model';
import { environment } from '../environments/environment';

export interface InvoiceFilters {
  status?: string;
  search?: string;
}

export interface InvoiceCreatePayload {
  client_id: string;
  numero?: string;
  type?: 'proforma' | 'facture';
  bl_number?: string;
  payment_mode?: string;
  payment_conditions?: string;
  bank_name?: string;
  bank_rib?: string;
  tva_rate?: number;
  notes?: string;
  lines: Array<{
    product_id: string;
    quantity: number;
    unit_price_ht: number;
    discount_pct: number;
  }>;
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly API = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) {}

  getInvoices(filters?: InvoiceFilters): Observable<Invoice[]> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.search) params = params.set('search', filters.search);
    return this.http.get<Invoice[]>(this.API, { params });
  }

  getById(id: string): Observable<{ invoice: Invoice; lines: InvoiceLine[] }> {
    return this.http.get<{ invoice: Invoice; lines: InvoiceLine[] }>(`${this.API}/${id}`);
  }

  create(data: InvoiceCreatePayload): Observable<any> {
    return this.http.post(this.API, data);
  }

  update(id: string, data: any): Observable<any> {
    return this.http.put(`${this.API}/${id}`, data);
  }

  updateNumero(id: string, numero: string): Observable<any> {
    return this.http.put(`${this.API}/${id}/numero`, { numero });
  }

  updateType(id: string, type: 'proforma' | 'facture'): Observable<any> {
    return this.http.put(`${this.API}/${id}/type`, { type });
  }

  updateStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${this.API}/${id}/status`, { status });
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API}/dashboard/stats`);
  }
}
