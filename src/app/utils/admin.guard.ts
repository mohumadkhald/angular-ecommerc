import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { Observable, of } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { UserService } from '../service/user.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  private role :any = this.authService.getRole();

  canActivate(): Observable<boolean> {

        if (this.authService.isLoggedIn() && this.role === "ADMIN") {
          return of(true); // Using 'of' from RxJS
        } else {
          this.router.navigate(['/']);
          return of(false); // Using 'of' from RxJS
        }
  }
}
