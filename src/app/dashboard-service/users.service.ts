import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { ConfigService } from '../service/config.service';
import { DashboardService } from './dashboard.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl: string;


  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private configService: ConfigService,
    private dashboardService: DashboardService
  ) {
    this.apiUrl = configService.getApiUri();
  }

  getUsers(page: number, pageSize: number): Observable<any> {
    const url = `${this.apiUrl}/users?page=${page}&pageSize=${pageSize}`;

    return this.http.get<any>(url).pipe(
      tap((response) => {
        return response;
      })
    );
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/users/${userId}`).pipe(
      tap(() => this.dashboardService.refreshCounts())
    );
  }

  getUserDetails(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${userId}`);
  }

  addUser(user: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/users`, user)
      .pipe(tap(() => this.dashboardService.refreshCounts()));
  }

  updateUserStatus(userId: number, params: any): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/users/status/${userId}`,
      {},
      { params }
    );
  }
}
