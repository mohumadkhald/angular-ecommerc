// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {BehaviorSubject, catchError, Observable, of} from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'token';
  private baseUrl = 'https://ec2-54-167-172-156.compute-1.amazonaws.com:8443/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, { email, password }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          this.saveToken(response.token);
        }
      })
    );
  }

  register(firstname: string, lastname: string, email: string, password: string, gender: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, { firstname, lastname, email, password, gender });
  }

  getProfile(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`${this.baseUrl}/users/profile`, { headers }).pipe(
      catchError(error => {
        console.error('Profile error', error);
        return of(null); // Return null or handle error appropriately
      })
    );
  }

  logout(): Observable<any> {
    const token = this.getToken();
    return this.http.post(`${this.baseUrl}/auth/logout`, {}, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    }).pipe(
      tap(() => {
        localStorage.removeItem(this.tokenKey);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}
