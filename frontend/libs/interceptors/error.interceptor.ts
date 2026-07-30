import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

export const HTTP_ERROR_KEYS: Record<number, string> = {
  400: 'errors.generic',
  401: 'errors.unauthorized',
  403: 'errors.forbidden',
  404: 'errors.notFound',
  500: 'errors.serverError',
};

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private message: MessageService,
    private translate: TranslateService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const silent = error.status === 401 || req.url.includes('/auth/refresh');
        if (!silent) {
          const key = HTTP_ERROR_KEYS[error.status] || 'errors.generic';
          this.translate.get(key).subscribe(msg => {
            this.message.add({ severity: 'error', summary: 'Erreur', detail: msg, life: 4000 });
          });
        }
        return throwError(() => error);
      })
    );
  }
}
