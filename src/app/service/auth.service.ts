// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ExpiredSessionDialogComponent } from '../component/expired-session-dialog/expired-session-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'token';
  private roleKey = 'role';
  private baseUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
    private dialog: MatDialog
  ) {}

  login(email: string, password: string): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/auth/login`, { email, password })
      .pipe(
        tap((response: any) => {
          if (response && response.token) {
            this.saveToken(response.token);
            this.saveRole(response.role);
            this.setLogoutTimeout();
          }
        })
      );
  }

  register(
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    gender: string
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, {
      firstname,
      lastname,
      email,
      password,
      gender,
    }) .pipe(
      tap((response: any) => {
        if (response && response.token) {
          this.saveToken(response.token);
          this.saveRole(response.role);
          this.setLogoutTimeout();
        }
      })
    );;
  }

  showExpiredSessionDialog(message: string): void {
    this.dialog.open(ExpiredSessionDialogComponent, {
      width: '350px',
      height: '200px',
      data: { message: message },
    });
  }

  getProfile(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get(`${this.baseUrl}/auth/profile`, { headers }).pipe(
      catchError((error) => {
        if (error.error.message == 'Token not valid' || error.status === 403 || error.status === 401) {
          this.cookieService.delete(this.tokenKey);
          this.cookieService.delete(this.roleKey);
          this.cookieService.delete('tokenExpiry');
          this.router.navigate([`/login`]);
        } else {
          console.log(error)
        }
        return of(null);
      })
    );
  }

  updateProfile(user: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .put(`${this.baseUrl}/auth/profile`, user, { headers })
      .pipe();
  }

  changePhoto(image: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.patch<any>(`${this.baseUrl}/auth/photo`, formData, {
      headers,
    });
  }

  logout(): Observable<any> {
    const token = this.getToken();
    return this.http
      .post(
        `${this.baseUrl}/auth/logout`,
        {},
        {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`,
          }),
        }
      )
      .pipe(
        tap(() => {
          this.clearAuthState();
        })
      );
  }
  
  clearAuthState(): void {
    this.cookieService.delete(this.tokenKey);
    this.cookieService.delete(this.roleKey);
    this.cookieService.delete('tokenExpiry');
  }

  isLoggedIn(): boolean {
    return !!this.cookieService.get(this.tokenKey);
  }

  saveToken(token: string): void {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1); // Set expiration to 1 day from now
    this.cookieService.set(this.tokenKey, token, { expires: expiryDate });

    // Save the expiration time in another cookie
    this.cookieService.set('tokenExpiry', expiryDate.getTime().toString(), {
      expires: expiryDate,
    });
  }

  getToken(): string {
    return this.cookieService.get(this.tokenKey);
  }

  saveRole(role: string): void {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1); // Set expiration to 1 day from now
    this.cookieService.set(this.roleKey, role, { expires: expiryDate });

    // Save the expiration time in another cookie
    this.cookieService.set('tokenExpiry', expiryDate.getTime().toString(), {
      expires: expiryDate,
    });
  }

  getRole(): string {
    return this.cookieService.get(this.roleKey);
  }

  private setLogoutTimeout(): void {
    const expiryTime = this.cookieService.get('tokenExpiry');
    if (expiryTime) {
      const expiryDate = new Date(parseInt(expiryTime, 10));
      const now = new Date();
      const timeLeft = expiryDate.getTime() - now.getTime();

      // Ensure logout is scheduled before the cookie expires
      if (timeLeft > 0) {
        setTimeout(() => {
          this.logout().subscribe();
        }, Math.max(timeLeft - 5000, 0));
      }
    }
  }
}
