import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = 'https://ec2-13-247-87-159.af-south-1.compute.amazonaws.com:8443/api/users';

  constructor(private http: HttpClient, private authService: AuthService) {}
  private token = this.authService.getToken();


  getUsers(page: number, pageSize: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    const url = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;

    return this.http.get<any>(url, { headers });
  }
  deleteUser(userId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.delete<any>(`${this.apiUrl}/${userId}`, { headers });
  }

  getUserDetails(userId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get<any>(`${this.apiUrl}/${userId}`, { headers });
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
      `${this.apiUrl}/status/${userId}`,
      {},
      { headers, params }
    );
  }
}
