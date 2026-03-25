import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const SKIP_AUTH_ENDPOINTS = ['users/login', 'users/register', 'users/refresh-token'];

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isSkippedEndpoint = SKIP_AUTH_ENDPOINTS.some((endpoint) => req.url.includes(endpoint));
  // Evita mandar Authorization en GET públicos para reducir problemas de CORS/preflight
  // (Home/Galería cargan con GET /api/articles).
  const isPublicArticlesGet =
    req.method === 'GET' &&
    req.url.includes('/api/articles') &&
    !req.url.includes('/api/articles/admin');

  const shouldSkipAuthorization = isSkippedEndpoint || isPublicArticlesGet;
  const token = authService.getToken();

  const authReq = !shouldSkipAuthorization && token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const refreshToken = authService.getRefreshToken();
      const tokenExpired =
        error.status === 401 &&
        !shouldSkipAuthorization &&
        !!refreshToken &&
        (error.error?.code === 'TOKEN_EXPIRED' || String(error.error?.message || '').toLowerCase().includes('expir'));

      if (!tokenExpired || !refreshToken) {
        return throwError(() => error);
      }

      return authService.refreshToken(refreshToken).pipe(
        switchMap((res: any) => {
          authService.setSession(res.token, res.refreshToken);
          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${res.token}`,
            },
          });
          return next(retryReq);
        }),
        catchError((refreshError) => {
          authService.clearSession();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
