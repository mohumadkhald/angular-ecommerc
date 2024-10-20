// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ExpiredSessionDialogComponent } from '../component/expired-session-dialog/expired-session-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from './user.service';
import { ConfigService } from '../config.service';

@Injectable({
  providedIn: 'root',
})

// export class AuthService {
//   private tokenKey = 'token';
//   private roleKey = 'role';
//   private baseUrl = 'http://localhost:8080/api';
//   private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

//   constructor(
//     private http: HttpClient,
//     private router: Router,
//     private cookieService: CookieService,
//     private dialog: MatDialog
//   ) {}

//   get isLoggedIn$() {
//     return this.loggedIn.asObservable();
//   }

//   private hasToken(): boolean {
//     return !!localStorage.getItem(this.tokenKey);
//   }

//   login(email: string, password: string): Observable<any> {
//     return this.http.post(`${this.baseUrl}/auth/login`, { email, password }).pipe(
//       tap((response: any) => {
//         if (response && response.token) {
//           this.saveToken(response.token);
//           this.saveRole(response.role);
//           this.setLogoutTimeout();
//           this.loadProfile().subscribe();
//         }
//       })
//     );
//   }

//   register(firstname: string, lastname: string, email: string, password: string, gender: string): Observable<any> {
//     return this.http.post(`${this.baseUrl}/auth/register`, { firstname, lastname, email, password, gender }).pipe(
//       tap((response: any) => {
//         if (response && response.token) {
//           this.saveToken(response.token);
//           this.saveRole(response.role);
//           this.setLogoutTimeout();
//         }
//       })
//     );
//   }

//   loadProfile(): Observable<any> {
//     const token = this.getToken();
//     const headers = new HttpHeaders({
//       Authorization: `Bearer ${token}`,
//     });

//     return this.http.get(`${this.baseUrl}/auth/profile`, { headers }).pipe(
//       catchError((error) => {
//         // Handle error
//         return of(null);
//       })
//     );
//   }

//   updateProfile(user: any): Observable<any> {
//     const token = this.getToken();
//     const headers = new HttpHeaders({
//       Authorization: `Bearer ${token}`,
//     });

//     return this.http.put(`${this.baseUrl}/auth/profile`, user, { headers });
//   }

//   changePhoto(image: File): Observable<any> {
//     const formData = new FormData();
//     formData.append('image', image);
//     const token = this.getToken();
//     const headers = new HttpHeaders({
//       Authorization: `Bearer ${token}`,
//     });

//     return this.http.patch<any>(`${this.baseUrl}/auth/photo`, formData, { headers });
//   }

//   logout(): Observable<any> {
//     const token = this.getToken();
//     return this.http
//       .post(
//         `${this.baseUrl}/auth/logout`,
//         {},
//         {
//           headers: new HttpHeaders({
//             Authorization: `Bearer ${token}`,
//           }),
//         }
//       )
//       .pipe(
//         tap(() => {
//           this.clearAuthState();
//           this.loggedIn.next(false);
//         })
//       );
//   }

//   clearAuthState(): void {
//     this.cookieService.delete(this.roleKey);
//     this.cookieService.delete('tokenExpiry');
//     localStorage.removeItem(this.tokenKey);
//   }

//   isLoggedIn(): boolean {
//     return !!localStorage.getItem(this.tokenKey);
//   }

//   saveToken(token: string): void {
//     localStorage.setItem(this.tokenKey, token);
//     this.loggedIn.next(true);
//   }

//   getToken(): string | null {
//     return localStorage.getItem(this.tokenKey);
//   }

//   saveRole(role: string): void {
//     const expiryDate = new Date();
//     expiryDate.setDate(expiryDate.getDate() + 1); // Set expiration to 1 day from now
//     this.cookieService.set(this.roleKey, role, { expires: expiryDate });

//     // Save the expiration time in another cookie
//     this.cookieService.set('tokenExpiry', expiryDate.getTime().toString(), {
//       expires: expiryDate,
//     });
//   }

//   getRole(): string {
//     return this.cookieService.get(this.roleKey);
//   }

//   private setLogoutTimeout(): void {
//     const expiryTime = this.cookieService.get('tokenExpiry');
//     if (expiryTime) {
//       const expiryDate = new Date(parseInt(expiryTime, 10));
//       const now = new Date();
//       const timeLeft = expiryDate.getTime() - now.getTime();

//       // Ensure logout is scheduled before the cookie expires
//       if (timeLeft > 0) {
//         setTimeout(() => {
//           this.logout().subscribe();
//         }, Math.max(timeLeft - 5000, 0));
//       }
//     }
//   }

//   showExpiredSessionDialog(message: string): void {
//     this.dialog.open(ExpiredSessionDialogComponent, {
//       width: '350px',
//       height: '200px',
//       data: { message },
//     });
//   }
// }
export class AuthService {
  private tokenKey = 'token';
  private roleKey = 'role';
  private baseUrl: string;
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
    private dialog: MatDialog,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.getApiUri();
  }

  get isLoggedIn$() {
    return this.loggedIn.asObservable();
  }

  private hasToken(): boolean {
    return this.cookieService.check(this.tokenKey);
  }

  login(email: string, password: string, remember: boolean): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/auth/login`, { email, password, remember })
      .pipe(
        tap((response: any) => {
          if (response && response.token) {
            this.saveToken(response.token);
            this.loadProfile().subscribe();
          }
        })
      );
  }

  register(
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    gender: string,
    role: string
  ): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/auth/register`, {
        firstname,
        lastname,
        email,
        password,
        gender,
        role
      })
      .pipe(
        tap((response: any) => {
          if (response && response.token) {
            this.saveToken(response.token);
            this.loadProfile().subscribe();
          }
        })
      );
  }

  loadProfile(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get(`${this.baseUrl}/auth/profile`, { headers }).pipe();
  }

  updateProfile(user: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.put(`${this.baseUrl}/auth/profile`, user, { headers });
  }

  changePhoto(image: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .patch<any>(`${this.baseUrl}/auth/photo`, formData, { headers })
      .pipe(
        catchError((error) => {
          console.error('Change photo error:', error);
          return of(null);
        })
      );
  }

  logout(): Observable<HttpResponse<any>> {
    const token = this.getToken();
    return this.http
      .post(
        `${this.baseUrl}/auth/logout`,
        {},
        {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`,
          }),
          observe: 'response' // Observe the full HTTP response
        }
      )
      .pipe(
        tap(response => {
          if (response.status === 200) {
            this.clearAuthState();
            this.loggedIn.next(false);
          }
        }),
        catchError((error) => {
          console.error('Logout error:', error);
          this.clearAuthState();
          this.loggedIn.next(false);
          return of(new HttpResponse<any>({ status: 500 })); // Return an empty HttpResponse with a 500 status
        })
      );
  }
  
  
  clearAuthState(): void {
    console.log('Clearing authentication state...');
    this.cookieService.delete(this.tokenKey, '/');
    this.cookieService.delete(this.roleKey, '/');
    this.cookieService.delete('tokenExpiry', '/');
  }

  isLoggedIn(): boolean {
    return this.cookieService.check(this.tokenKey);
  }

  saveToken(token: string): void {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1); // Set expiration to 1 day from now
    this.cookieService.set(this.tokenKey, token, {
      expires: expiryDate,
      path: '/',
    });
    this.loggedIn.next(true);
  }

  getToken(): string | null {
    return this.cookieService.get(this.tokenKey);
  }

  saveRole(role: string): void {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1); // Set expiration to 1 day from now
    this.cookieService.set(this.roleKey, role, {
      expires: expiryDate,
      path: '/',
    });

    // Save the expiration time in another cookie
    this.cookieService.set('tokenExpiry', expiryDate.getTime().toString(), {
      expires: expiryDate,
      path: '/',
    });
  }

  getRole(): string {
    return this.cookieService.get(this.roleKey);
  }

  showExpiredSessionDialog(message: string): void {
    this.dialog.open(ExpiredSessionDialogComponent, {
      width: '350px',
      height: '200px',
      data: { message },
    });
  }
}
