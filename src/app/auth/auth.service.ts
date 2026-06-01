import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

// import { environment } from '../../environments/environment';

const DATA_SERVICE_URL = (window as any).DATA_SERVICE_URL || 'http://data_service:8000';
const REGISTER_ENDPOINT = '/register';
const LOGIN_ENDPOINT = '/login';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${DATA_SERVICE_URL}${LOGIN_ENDPOINT}`, [username, password]).pipe(
      tap((res: any) => {
        if (res.access_token) this.setSession(res);
      })
    );
  }

  register(userData: { name: string; username: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${DATA_SERVICE_URL}${REGISTER_ENDPOINT}`, userData).pipe(
      tap((res: any) => {
        if (res.access_token) this.setSession(res);
      })
    );
  }

  private setSession(authResult: any) {
    localStorage.setItem('token', authResult.access_token);
    localStorage.setItem('username', authResult.username || '');
    this.loggedInSubject.next(true);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.loggedInSubject.next(false);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  getLoggedInStatus(): Observable<boolean> {
    return this.loggedInSubject.asObservable();
  }
}