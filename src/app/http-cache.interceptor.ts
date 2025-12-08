import { HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

const cache = new Map<string, HttpResponse<any>>();

export const httpCacheInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<any>> => {

  if (req.method !== 'GET') {
    return next(req);
  }

  const cached = cache.get(req.urlWithParams);

  if (cached) {
    return of(cached.clone());
  }

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        cache.set(req.urlWithParams, event.clone());
      }
    })
  );
};
