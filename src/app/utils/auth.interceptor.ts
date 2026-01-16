// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { UserService } from '../service/user.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);
  const authToken = authService.getToken();

  // List of public URL patterns (static and dynamic)
  const publicUrlPatterns = [
    new RegExp('/api/sub-categories/find'),
    //  new RegExp('/api/sub-categories$'),
    new RegExp('/api/products/product-category/($|\\?)'),
    new RegExp('/api/products/\\d+/emails'), // Matches /api/products/{id}/emails
  ];

  // Check if the request URL matches any public pattern
  const isPublicUrl = publicUrlPatterns.some((pattern) =>
    pattern.test(req.url)
  );

  // Clone the request and add Authorization header only if it's not a public URL
  const clonedRequest =
    !isPublicUrl && authToken
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${authToken}`,
          },
        })
      : req;

  return next(clonedRequest).pipe(
    catchError((error) => {
      // if (error.status === 401 || error.status === 403) {
      //   authService.clearAuthState();
      //   userService.clearUsername();

      //   router
      //     .navigate(['/auth'], { queryParams: { state: 'login' } })
      //     .then(() => {
      //       setTimeout(() => {
      //         const dialogRef = authService.showExpiredSessionDialog(
      //           'Your Session Expired'
      //         );

      //         // Wait until the dialog closes, then reload
      //         dialogRef.afterClosed().subscribe(() => {
      //           window.location.reload();
      //         });
      //       }, 300); // let routing settle first
      //     });
      // }
      return throwError(() => error);
    })
  );
};

// if (router.url !== '/auth') {
//   // router.navigate(['/login']).then(() => {
//     setTimeout(() => {
//       // window.location.reload();
//       router.navigate(['/auth'], { queryParams:{ state: 'login' } })
//     }, 1500);
//     setTimeout(() => {
//       window.location.reload();
//     },1800);
//   // });
// }
