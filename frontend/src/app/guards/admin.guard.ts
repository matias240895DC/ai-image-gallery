import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of, switchMap, tap } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (!token) {
    router.navigate(['/'], { replaceUrl: true });
    return false;
  }

  // Confirmación con backend: si NO es admin, no permitimos ni mostrar UI.
  if (authService.isAccessTokenValid()) {
    return authService.verifyAdminSession().pipe(
      tap((ok) => {
        if (!ok) {
          authService.clearSession();
          router.navigate(['/'], { replaceUrl: true });
        }
      }),
      map((ok) => ok),
      catchError(() => {
        authService.clearSession();
        router.navigate(['/'], { replaceUrl: true });
        return of(false);
      }),
    );
  }

  const refreshToken = authService.getRefreshToken();
  if (!refreshToken) {
    authService.clearSession();
    router.navigate(['/'], { replaceUrl: true });
    return false;
  }

  return authService.refreshToken(refreshToken).pipe(
    tap((res: any) => {
      authService.setSession(res.token, res.refreshToken, authService.getUser());
    }),
    switchMap(() => authService.verifyAdminSession()),
    tap((ok) => {
      if (!ok) {
        authService.clearSession();
        router.navigate(['/'], { replaceUrl: true });
      }
    }),
    map((ok) => ok),
    catchError(() => {
      authService.clearSession();
      router.navigate(['/'], { replaceUrl: true });
      return of(false);
    }),
  );
};
