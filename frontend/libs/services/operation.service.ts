import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Operation, OperationTotals } from '../models/operation.model';
import { environment } from '../environments/environment';

export interface OperationFilters {
  search?: string;
  status?: string;
  category?: string;
}

@Injectable({ providedIn: 'root' })
export class OperationService {
  private readonly API = `${environment.apiUrl}/operations`;

  constructor(private http: HttpClient) {}

  getById(id: string): Observable<Operation> {
    return this.http.get<Operation>(`${this.API}/${id}`);
  }

  getOperations(filters?: OperationFilters): Observable<Operation[]> {
    let params = new HttpParams();
    if (filters?.search)   params = params.set('search',   filters.search);
    if (filters?.status)   params = params.set('status',   filters.status);
    if (filters?.category) params = params.set('category', filters.category);
    return this.http.get<Operation[]>(this.API, { params });
  }

  getTotals(): Observable<OperationTotals> {
    return this.http.get<OperationTotals>(`${this.API}/totals`);
  }

  create(data: Partial<Operation>): Observable<any> {
    return this.http.post(this.API, data);
  }

  update(id: string, data: Partial<Operation>): Observable<any> {
    return this.http.put(`${this.API}/${id}`, data);
  }

  markAsPaid(id: string): Observable<any> {
    return this.http.put(`${this.API}/${id}/pay`, {});
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }
}
