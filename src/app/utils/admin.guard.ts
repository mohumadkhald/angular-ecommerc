import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { combineLatest, map, Observable, of } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { UserService } from '../service/user.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    const loggedIn = this.authService.isLoggedIn();
    const role = this.authService.getRole();

    // console.log('Guard check:', loggedIn, role);

    if (loggedIn && role === 'ADMIN') {
      return true;
    }

    this.router.navigate(['/']);
    return false;
  }
}
