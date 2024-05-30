import { Injectable } from '@angular/core';
import {BehaviorSubject, catchError, Observable, of} from 'rxjs';
import {tap} from "rxjs/operators";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usernameSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  public username$: Observable<string | null> = this.usernameSubject.asObservable();
  private profileLoaded: boolean = false;

  constructor(private authService: AuthService) {}

  setUsername(username: string): void {
    this.usernameSubject.next(username);
  }

  clearUsername(): void {
    this.usernameSubject.next(null);
  }

  loadProfile(): Observable<any> {
    if (this.profileLoaded) {
      return of(null); // Return an empty observable if the profile is already loaded
    }
    return this.authService.getProfile().pipe(
      tap(response => {
        if (response) {
          this.setUsername(`${response.firstName} ${response.lastName}`);
          this.profileLoaded = true;
        }
      }),
      catchError(error => {
        console.error('Profile error', error);
        this.clearUsername();
        return of(null);
      })
    );
  }
}
