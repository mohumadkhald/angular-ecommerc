// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {catchError, Observable, of} from 'rxjs';
import { tap } from 'rxjs/operators';
import { error } from '@angular/compiler-cli/src/transformers/util';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey = 'token';
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private router: Router) {
  
  }

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
        console.log(error.error.message);
        if(error.error.message == "Token not valid") {
          localStorage.removeItem("token");
          this.router.navigate([`/login`])
        }
        return of(null);
      })
    );
  }
  updateProfile(user: any) {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.put(`${this.baseUrl}/users/profile`, user, { headers }).pipe(
      catchError(error => {
        console.log(error.error.message);
        if(error.error.message == "Token not valid") {
          localStorage.removeItem("token");
          this.router.navigate([`/login`])
        }
        return of(null);
      })
    );
  }


  changePhoto(image: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.patch<any>(`${this.baseUrl}/users/photo`, formData, { headers });
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
