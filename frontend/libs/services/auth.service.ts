import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.apiUrl;
  private readonly TOKEN_KEY = 'access_token';
  private tokenSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('access_token')
  );

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.API}/auth/login`, { username, password }).pipe(
      tap((res: any) => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        this.tokenSubject.next(res.token);
        localStorage.setItem('lastLogin', new Date().toISOString());
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.tokenSubject.next(null);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.tokenSubject.value;
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.API}/auth/me`);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.API}/auth/change-password`, { currentPassword, newPassword });
  }

  getLastLogin(): string | null {
    return localStorage.getItem('lastLogin');
  }
}
