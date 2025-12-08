import { HttpInterceptorFn } from '@angular/common/http';

import { delay } from 'rxjs/operators';

export const delayInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    delay(300) // ⏱️ delay 1 second before returning response
  );
};
