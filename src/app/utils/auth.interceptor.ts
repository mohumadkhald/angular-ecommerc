// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { UserService } from '../service/user.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const userService = inject(UserService)
  const router = inject(Router);
  const authToken = authService.getToken();

  const clonedRequest = authToken
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`,
        },
      })
    : req;

  return next(clonedRequest).pipe(
    catchError((error) => {
      if (error.status === 401) {
        authService.showExpiredSessionDialog('Your Session Expired');
        authService.clearAuthState();
        userService.clearUsername();
        if (router.url !== '/login') {
          // router.navigate(['/login']).then(() => {
            setTimeout(() => {
              // window.location.reload();
              router.navigate(['/login'])
            }, 1500)
          // });
        }
      }
      return throwError(() => error);
    })
  );
};
