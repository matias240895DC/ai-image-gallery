import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { NavigationLockService } from '../services/navigation-lock.service';
import { AuthService } from '../services/auth.service';

export const navigationLockGuard: CanActivateFn = (route, state) => {
  const navigationLock = inject(NavigationLockService);
  const router = inject(Router);
  const authService = inject(AuthService);

  // state.url puede traer query; el lock lo guardamos solo con la ruta
  const expectedUrl = String(state.url || '').split('?')[0];
  const ok = navigationLock.consume(expectedUrl);

  if (ok) return true;

  // Bloqueamos navegación "directa" (teclear URL) y volvemos a una página permitida
  const hasToken = !!authService.getToken();
  return router.parseUrl(hasToken ? '/gallery' : '/login');
};

