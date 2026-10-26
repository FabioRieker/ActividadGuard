import { Injectable, signal, computed } from '@angular/core';

export interface UserSession {
  username: string;
  role: 'admin' | 'user';
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Clave empleada en la Web Storage API
  private readonly STORAGE_KEY = 'DAM2_AUTH_SESSION';

  // Signal reactivo para el estado en memoria
  private _currentUser = signal<UserSession | null>(this.readSessionFromStorage());

  // Selectores computados de solo lectura expuestos a la aplicación
  public currentUser = this._currentUser.asReadonly();
  public isAuthenticated = computed(() => this._currentUser()?.isAuthenticated ?? false);

  /**
   * Valida credenciales requeridas: admin / 123 y operador / 123
   */
  public login(user: string, pass: string): boolean {
    if (user === 'admin' && pass === '123') {
      const sessionData: UserSession = {
        username: user,
        role: 'admin',
        isAuthenticated: true
      };

      // 1. Guardar en memoria reactiva
      this._currentUser.set(sessionData);

      // 2. Persistir en el navegador (sessionStorage y localStorage para persistir al copiar URL en nuevas pestañas)
      const serialized = JSON.stringify(sessionData);
      sessionStorage.setItem(this.STORAGE_KEY, serialized);
      localStorage.setItem(this.STORAGE_KEY, serialized);

      return true;
    } else if (user === 'operador' && pass === '123') {
      const sessionData: UserSession = {
        username: user,
        role: 'user',
        isAuthenticated: true
      };

      // 1. Guardar en memoria reactiva
      this._currentUser.set(sessionData);

      // 2. Persistir en el navegador (sessionStorage y localStorage para persistir al copiar URL en nuevas pestañas)
      const serialized = JSON.stringify(sessionData);
      sessionStorage.setItem(this.STORAGE_KEY, serialized);
      localStorage.setItem(this.STORAGE_KEY, serialized);

      return true;
    }

    return false;
  }

  /**
   * Destruye la sesión activa en memoria y en almacenamiento local
   */
  public logout(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STORAGE_KEY);
    this._currentUser.set(null);
  }

  /**
   * Recupera la sesión al refrescar la página o al pegar la URL en otra pestaña
   */
  private readSessionFromStorage(): UserSession | null {
    const rawData = sessionStorage.getItem(this.STORAGE_KEY) || localStorage.getItem(this.STORAGE_KEY);
    if (!rawData) {
      return null;
    }
    try {
      const session = JSON.parse(rawData) as UserSession;
      // Mantener sincronizados ambos storages
      sessionStorage.setItem(this.STORAGE_KEY, rawData);
      localStorage.setItem(this.STORAGE_KEY, rawData);
      return session;
    } catch {
      sessionStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }
}
