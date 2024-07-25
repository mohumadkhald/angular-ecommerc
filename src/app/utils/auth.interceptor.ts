// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const cookieService = inject(CookieService); // Inject CookieService
  const authToken = authService.getToken();
  const reloadFlagCookie = 'reloadFlag';

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
        authService.clearAuthState(); // Ensure auth state is cleared on 401

        // Check if the reload flag cookie is set
        const hasReloaded = cookieService.get(reloadFlagCookie);

        if (router.url !== '/login') {
          if (hasReloaded) {
            router.navigate(['/login']).then(() => {
              window.location.reload();
            });
          } else {
            // Set the reload flag cookie
            cookieService.set(reloadFlagCookie, 'true');
            router.navigate(['/login']);
          }
        }
      }
      return throwError(() => error);
    })
  );
};
