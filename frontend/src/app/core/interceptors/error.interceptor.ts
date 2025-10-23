import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error) => {
      // Wyświetl komunikat błędu
      let errorMessage = 'Wystąpił nieoczekiwany błąd';

      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Nie pokazuj toastra dla błędu 401 (obsługiwany przez authInterceptor)
      if (error.status !== 401) {
        toastr.error(errorMessage, 'Błąd');
      }

      return throwError(() => error);
    })
  );
};
