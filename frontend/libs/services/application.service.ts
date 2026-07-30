import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Application } from '../models/application.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly API = `${environment.apiUrl}/application`;

  constructor(private http: HttpClient) {}

  getSettings(): Observable<Application> {
    return this.http.get<Application>(this.API).pipe(
      tap(app => {
        if (app.logo !== undefined) localStorage.setItem('app_logo', app.logo || '');
        if (app.name) localStorage.setItem('app_name', app.name);
      })
    );
  }

  getPublicBranding(): Observable<{ name: string; logo: string }> {
    return this.http.get<{ name: string; logo: string }>(`${this.API}/public`);
  }

  updateSettings(data: Partial<Application>): Observable<any> {
    return this.http.put(this.API, data);
  }

  getCachedLogo(): string | null {
    return localStorage.getItem('app_logo') || null;
  }

  getCachedName(): string {
    return localStorage.getItem('app_name') || 'Specialty Coffee Equipment';
  }
}
