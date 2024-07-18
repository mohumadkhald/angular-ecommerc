import { Injectable, OnInit } from '@angular/core';
import {BehaviorSubject, catchError, Observable, of} from 'rxjs';
import {tap} from "rxjs/operators";
import {AuthService} from "./auth.service";
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnInit {
  private usernameSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private imgSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  public username$: Observable<string | null> = this.usernameSubject.asObservable();
  public img$: Observable<string | null> = this.imgSubject.asObservable();

  private roleSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public role$: Observable<any> = this.roleSubject.asObservable();
  
  private profileLoaded: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadProfile().subscribe();
  }

  setUsername(username: string): void {
    this.usernameSubject.next(username);
  }

  clearUsername(): void {
    this.usernameSubject.next(null);
  }

  setImg(imgUrl: any): void {
    this.imgSubject.next(imgUrl);
  }
  setRole(role: any): void {
    this.roleSubject.next(role);
  }

  loadProfile(): Observable<any> {
    return this.authService.getProfile().pipe(
      tap(response => {
        if (response) {
          this.setUsername(`${response.firstName} ${response.lastName}`);
          this.setImg(`${response.imageUrl}`);
          this.setRole(`${response.role}`)
          this.profileLoaded = true;
        }
      }),
      catchError(error => {
        if (error.status === 403) {
          localStorage.removeItem("token");
          this.router.navigate([`/login`]);
        }
        this.clearUsername();
        return of(null);
      })
    );
  }

  updateProfile(user: any): Observable<any> {
    return this.authService.updateProfile(user).pipe(
      tap(response => {
        if (response) {
          console.log(response);
          // this.setUsername(`${response.firstName} ${response.lastName}`);
          // this.setImg(`${response.imageUrl}`);
          // this.profileLoaded = true;
        }
      }),
      catchError(error => {
        console.log('Profile error', error);
        this.clearUsername();
        return of(null);
      })
    );
  }

  
}
