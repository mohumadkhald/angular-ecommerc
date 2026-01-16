import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private usernameSubject = new BehaviorSubject<string | null>(null);
  private imgSubject = new BehaviorSubject<string | null>(null);
  private roleSubject = new BehaviorSubject<any>(null);

  username$ = this.usernameSubject.asObservable();
  img$ = this.imgSubject.asObservable();
  role$ = this.roleSubject.asObservable();

  private profileCache$?: Observable<any>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // 🔥 MAIN method (used by Header)
  loadProfile(): Observable<any> {
    if (!this.profileCache$) {
      this.profileCache$ = this.authService.loadProfile().pipe(
        tap(profile => {
          if (profile) {
            this.usernameSubject.next(
              `${profile.firstName} ${profile.lastName}`
            );
            this.imgSubject.next(profile.imageUrl);
            this.roleSubject.next(profile.role);
            this.authService.saveRole(profile.role);
          }
        }),
        catchError(error => {
          this.clear();
          return of(null);
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }

    return this.profileCache$;
  }

  // 🔄 Call on login / OAuth success
  refreshProfile(): Observable<any> {
    this.profileCache$ = undefined;
    return this.loadProfile();
  }

  // 🔐 Call on logout
  clear(): void {
    this.profileCache$ = undefined;
    this.usernameSubject.next(null);
    this.imgSubject.next(null);
    this.roleSubject.next(null);
  }

  updateProfile(user: any): Observable<any> {
    return this.authService.updateProfile(user).pipe(
      tap(profile => {
        if (profile) {
          this.usernameSubject.next(
            `${profile.firstName} ${profile.lastName}`
          );
          this.imgSubject.next(profile.imageUrl);
          this.roleSubject.next(profile.role);
        }
      }),
      catchError(() => of(null))
    );
  }
}
