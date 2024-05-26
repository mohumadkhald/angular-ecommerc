// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { email, password });
  }

  register(firstname: string, lastname: string, email: string, password: string, gender: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, { firstname, lastname, email, password, gender });
  }

  logout() {

  }

  isLoggedIn() {

  }
}
