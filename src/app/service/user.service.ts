import { Injectable } from '@angular/core';
import {BehaviorSubject, catchError, Observable, of} from 'rxjs';
import {tap} from "rxjs/operators";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usernameSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private imgSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  public username$: Observable<string | null> = this.usernameSubject.asObservable();
  public img$: Observable<string | null> = this.imgSubject.asObservable();

  private profileLoaded: boolean = false;

  constructor(private authService: AuthService) {}

  setUsername(username: string): void {
    this.usernameSubject.next(username);
  }

  clearUsername(): void {
    this.usernameSubject.next(null);
  }
  setImg(imgUrl: any) {
    this.imgSubject.next(imgUrl);
  }


  loadProfile(): Observable<any> {
    return this.authService.getProfile().pipe(
      tap(response => {
        if (response) {
          this.setUsername(`${response.firstName} ${response.lastName}`);
          this.setImg(`${response.imageUrl}`);
          console.log(response)
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
