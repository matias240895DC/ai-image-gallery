import { Injectable } from '@angular/core';

type NavLockPayload = {
  url: string;
  ts: number;
};

@Injectable({
  providedIn: 'root',
})
export class NavigationLockService {
  private readonly KEY = 'navAllowed';
  private readonly TTL_MS = 5_000; // Ventana corta para que el click "valide" la navegación

  allow(url: string) {
    const payload: NavLockPayload = { url, ts: Date.now() };
    sessionStorage.setItem(this.KEY, JSON.stringify(payload));
  }

  consume(expectedUrl: string): boolean {
    const raw = sessionStorage.getItem(this.KEY);
    if (!raw) return false;

    try {
      const payload = JSON.parse(raw) as NavLockPayload;
      const age = Date.now() - payload.ts;
      const matches = payload.url === expectedUrl;

      sessionStorage.removeItem(this.KEY);

      return matches && age <= this.TTL_MS;
    } catch {
      sessionStorage.removeItem(this.KEY);
      return false;
    }
  }
}

