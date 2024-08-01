import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { ConfigService } from '../config.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl: string;

  constructor(private http: HttpClient, private authService: AuthService, private configService: ConfigService) {
    this.apiUrl = configService.getApiUri();
  }
  private token = this.authService.getToken();


  getUsers(page: number, pageSize: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    const url = `${this.apiUrl}/users?page=${page}&pageSize=${pageSize}`;

    return this.http.get<any>(url, { headers });
  }
  deleteUser(userId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.delete<any>(`${this.apiUrl}/users/${userId}`, { headers });
  }

  getUserDetails(userId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get<any>(`${this.apiUrl}/users/${userId}`, { headers });
  }

  addUser(user: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.post(this.apiUrl, user, { headers });
  }

  updateUserStatus(userId: number, params: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.patch<any>(
      `${this.apiUrl}/users/status/${userId}`,
      {},
      { headers, params }
    );
  }
}
