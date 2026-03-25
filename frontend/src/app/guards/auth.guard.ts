import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of, switchMap, tap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (!token) {
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }

  // Si el access token está vigente, permitimos el acceso a la ruta.
  if (authService.isAccessTokenValid()) {
    return authService.verifyAuthSession().pipe(
      tap((ok) => {
        if (!ok) {
          authService.clearSession();
          router.navigate(['/login'], { replaceUrl: true });
        }
      }),
      catchError(() => {
        authService.clearSession();
        router.navigate(['/login'], { replaceUrl: true });
        return of(false);
      }),
    );
  }

  // Si el token existe pero está vencido/invalidado, intentamos renovar.
  const refreshToken = authService.getRefreshToken();
  if (!refreshToken) {
    authService.clearSession();
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }

  // Si el refresh funciona, confirmamos con el backend que la sesión es válida.
  return authService.refreshToken(refreshToken).pipe(
    tap((res: any) => {
      authService.setSession(res.token, res.refreshToken, authService.getUser());
    }),
    switchMap(() => authService.verifyAuthSession()),
    tap((ok) => {
      if (!ok) {
        authService.clearSession();
        router.navigate(['/login'], { replaceUrl: true });
      }
    }),
    map((ok) => ok),
    catchError(() => {
      authService.clearSession();
      router.navigate(['/login'], { replaceUrl: true });
      return of(false);
    }),
  );
};
