// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
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
      if (error.status === 401 || error.status === 403) {
        authService.clearAuthState(); // Ensure auth state is cleared on 401
        if (router.url !== '/login') {
          router.navigate(['/login']).then(() => {
            window.location.reload();
          });
        }
      }
      return throwError(() => error);
    })
  );
};
