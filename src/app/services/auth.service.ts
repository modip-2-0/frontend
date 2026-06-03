import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

const DATA_SERVICE_URL = 'http://localhost:8000';
const REGISTER_ENDPOINT = '/register';
const LOGIN_ENDPOINT = '/login';

@Injectable({ providedIn: 'root' })
export class AuthService {
	private http = inject(HttpClient);
	private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

	login(email: string, password: string): Observable<any> {
		return this.http.post(`${DATA_SERVICE_URL}${LOGIN_ENDPOINT}`, [email, password]).pipe(
			tap((res: any) => {
				if (res?.access_token) {
					this.setSession(res, email);
				}
			})
		);
	}

	register(userData: { email: string; name: string; password: string }): Observable<any> {
		return this.http.post(`${DATA_SERVICE_URL}${REGISTER_ENDPOINT}`, userData).pipe(
			tap((res: any) => {
				if (res?.access_token) {
					this.setSession(res, userData.email);
				}
			})
		);
	}

	logout(): void {
		localStorage.removeItem('token');
		localStorage.removeItem('email');
		this.loggedInSubject.next(false);
	}

	isLoggedIn(): boolean {
		return this.hasToken();
	}

	getToken(): string | null {
		return localStorage.getItem('token');
	}

	getEmail(): string | null {
		return localStorage.getItem('email');
	}

	getLoggedInStatus(): Observable<boolean> {
		return this.loggedInSubject.asObservable();
	}

	private setSession(authResult: any, email: string): void {
		localStorage.setItem('token', authResult.access_token);
		localStorage.setItem('email', email);
		this.loggedInSubject.next(true);
	}

	private hasToken(): boolean {
		return !!localStorage.getItem('token');
	}
}
