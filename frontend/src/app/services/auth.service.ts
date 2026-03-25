import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, map, of } from 'rxjs';
import { Global } from './Global';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public url: string;
  public user: any;
  public token: string | null = null;
  
  // Estado reactivo de la autenticación
  private _authStatus = new BehaviorSubject<{token: string | null, user: any}>(this.getCurrentState());
  public authStatus$ = this._authStatus.asObservable();

  constructor(private _http: HttpClient) {
    this.url = Global.url;
  }

  private getCurrentState() {
    const token = localStorage.getItem('token');
    const rawUser = localStorage.getItem('user');
    const user = rawUser ? JSON.parse(rawUser) : null;
    return { token, user };
  }

  updateAuthStatus() {
    this._authStatus.next(this.getCurrentState());
  }

  register(user: any): Observable<any> {
    let params = JSON.stringify(user);
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(this.url + 'users/register', params, { headers: headers });
  }

  login(user: any): Observable<any> {
    let params = JSON.stringify(user);
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(this.url + 'users/login', params, { headers: headers });
  }

  refreshToken(refreshToken: string): Observable<any> {
    return this._http.post(this.url + 'users/refresh-token', { refreshToken });
  }

  setSession(token: string, refreshToken: string, user?: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    this.updateAuthStatus();
  }

  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.updateAuthStatus();
  }

  getRefreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    return refreshToken && refreshToken !== 'undefined' ? refreshToken : null;
  }

  getToken() {
    let token = localStorage.getItem('token');
    if (token && token != "undefined") {
      this.token = token;
    } else {
      this.token = null;
    }
    return this.token;
  }

  getUser() {
    const rawUser = localStorage.getItem('user');
    const user = rawUser ? JSON.parse(rawUser) : null;
    if (user && user != "undefined") {
      this.user = user;
    } else {
      this.user = null;
    }
    return this.user;
  }

  isSuperAdmin(): boolean {
    const u = this.getUser();
    return u && u.role === 'superadmin';
  }

  /**
   * Valida en el frontend que el access token no esté vencido.
   * Nota: esto solo mejora la seguridad de UI; el backend debe seguir protegiendo endpoints.
   */
  isAccessTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const payload = this.decodeJwtPayload(token);
    if (!payload) return false;

    // Si el token trae tokenType, exigimos que sea "access"
    if (payload.tokenType && payload.tokenType !== 'access') return false;

    // JWT exp normalmente viene en segundos desde epoch
    if (typeof payload.exp !== 'number') return false;

    return payload.exp * 1000 > Date.now();
  }

  private decodeJwtPayload(token: string): any | null {
    try {
      // jwt-simple suele generar JWT con 3 partes; aun así, hacemos búsqueda defensiva
      const parts = token.split('.');
      const candidates = parts.length >= 2 ? parts.slice(0) : [token];

      const decodeBase64Url = (value: string) => {
        const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
        const padding = '='.repeat((4 - (base64.length % 4)) % 4);
        return atob(base64 + padding);
      };

      // Intentar interpretar cada parte hasta hallar un JSON con exp
      for (const part of candidates) {
        // Saltar partes demasiado cortas para reducir errores
        if (!part || part.length < 10) continue;
        const decoded = decodeBase64Url(part);
        const json = JSON.parse(decoded);
        if (json && typeof json === 'object' && 'exp' in json) return json;
      }
      return null;
    } catch {
      return null;
    }
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    });
  }

  // ─── ADMIN ────────────────────────────────────────────────────────────────

  getUsers(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    const query = `?page=${page}&limit=${limit}&q=${search}`;
    console.log('[API-CALL] GET users:', this.url + `users/admin/users${query}`);
    return this._http.get(this.url + `users/admin/users${query}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getSecurityLogs(
    page: number = 1,
    limit: number = 20,
    search: string = '',
    status: string = ''
  ): Observable<any> {
    const query = `?page=${page}&limit=${limit}&q=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`;
    console.log('[API-CALL] GET logs:', this.url + `users/admin/logs${query}`);
    return this._http.get(this.url + `users/admin/logs${query}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getAdminArticles(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    const query = `?page=${page}&limit=${limit}&q=${encodeURIComponent(search)}`;
    return this._http.get(this.url + `articles/admin/articles${query}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getAdminAiImages(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    const query = `?page=${page}&limit=${limit}&q=${encodeURIComponent(search)}`;
    return this._http.get(this.url + `articles/admin/ai-images${query}`, {
      headers: this.getAuthHeaders(),
    });
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    console.log('[API-CALL] PATCH role:', this.url + `users/admin/role/${userId}`);
    return this._http.patch(
      this.url + `users/admin/role/${userId}`,
      { role },
      { headers: this.getAuthHeaders() }
    );
  }

  updateUserStatus(userId: string, status: string): Observable<any> {
    console.log('[API-CALL] PATCH status:', this.url + `users/admin/status/${userId}`);
    return this._http.patch(
      this.url + `users/admin/status/${userId}`,
      { status },
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Verifica con el backend si el token actual es válido para una ruta autenticada.
   * Devuelve `true` si el backend responde OK, `false` en cualquier error (401/403/etc).
   */
  verifyAuthSession(): Observable<boolean> {
    return this._http.get(this.url + 'users/private').pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  /**
   * Verifica con el backend si el token actual tiene permisos de admin (superadmin).
   * Usa un endpoint protegido por `adminAuth`.
   */
  verifyAdminSession(): Observable<boolean> {
    return this._http.get(this.url + 'users/admin/logs?page=1&limit=1').pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }
}
