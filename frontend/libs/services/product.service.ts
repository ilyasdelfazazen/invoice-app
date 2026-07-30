import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly API = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(search?: string): Observable<Product[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<Product[]>(this.API, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.API}/${id}`);
  }

  create(data: Partial<Product>): Observable<any> {
    return this.http.post(this.API, data);
  }

  update(id: string, data: Partial<Product>): Observable<any> {
    return this.http.put(`${this.API}/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }
}
