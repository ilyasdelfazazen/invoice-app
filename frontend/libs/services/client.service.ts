import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly API = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  getClients(search?: string): Observable<Client[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<Client[]>(this.API, { params });
  }

  getClientById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.API}/${id}`);
  }

  create(data: Partial<Client>): Observable<any> {
    return this.http.post(this.API, data);
  }

  update(id: string, data: Partial<Client>): Observable<any> {
    return this.http.put(`${this.API}/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }
}
