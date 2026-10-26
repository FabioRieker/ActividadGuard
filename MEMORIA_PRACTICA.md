# Memoria Técnica de Práctica: Control de Acceso y Protección de Rutas con Functional Guards

- **Módulo**: Desarrollo de Interfaces (0488) — 2º DAM
- **Alumno**: Fabio Rieker
- **Repositorio GitHub**: [https://github.com/FabioRieker/ActividadGuard](https://github.com/FabioRieker/ActividadGuard)
- **Despliegue Vercel**: [https://actividad-guard-six.vercel.app](https://actividad-guard-six.vercel.app)

---

## 1. Arquitectura y Enfoque Funcional

En este proyecto se implementa el modelo moderno de **Angular Standalone Components** junto con **Functional Guards (`CanActivateFn`)** en sustitución de las interfaces de clases heredadas (`CanActivate`).

### Ventajas clave:
1. **Funciones Puras e Inyección con `inject()`**: Los guards son funciones directas que resuelven sus dependencias en tiempo de ejecución sin boilerplate de constructores.
2. **Redirecciones Atómicas con `UrlTree`**: En lugar de retornar un booleano `false` (que dejaría la pantalla congelada o exigiría navegaciones asíncronas secundarias), se devuelve un objeto `router.createUrlTree(['/ruta'])`. Esto cancela instantáneamente la navegación solicitada y conmuta a la ruta de redirección en un solo ciclo atómico del enrutador.

---

## 2. Bloques de Código Clave

### 2.1. Servicio de Autenticación con Persistencia y Signals (`auth.service.ts`)
Garantiza el estado reactivo mediante **Angular Signals** y asegura la persistencia dual (`sessionStorage` y `localStorage`) para permitir que la sesión se conserve tanto en recargas como al copiar y pegar la URL en otras pestañas.

```typescript
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
  private readonly STORAGE_KEY = 'DAM2_AUTH_SESSION';

  // Signal reactivo para el estado en memoria
  private _currentUser = signal<UserSession | null>(this.readSessionFromStorage());

  // Selectores computados de solo lectura
  public currentUser = this._currentUser.asReadonly();
  public isAuthenticated = computed(() => this._currentUser()?.isAuthenticated ?? false);

  public login(user: string, pass: string): boolean {
    let role: 'admin' | 'user' | null = null;

    if (user === 'admin' && pass === '123') {
      role = 'admin';
    } else if (user === 'operador' && pass === '123') {
      role = 'user';
    }

    if (role) {
      const sessionData: UserSession = {
        username: user,
        role: role,
        isAuthenticated: true
      };

      // 1. Reactividad en memoria
      this._currentUser.set(sessionData);

      // 2. Persistencia en navegador (sessionStorage + localStorage)
      const serialized = JSON.stringify(sessionData);
      sessionStorage.setItem(this.STORAGE_KEY, serialized);
      localStorage.setItem(this.STORAGE_KEY, serialized);

      return true;
    }

    return false;
  }

  public logout(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STORAGE_KEY);
    this._currentUser.set(null);
  }

  private readSessionFromStorage(): UserSession | null {
    const rawData = sessionStorage.getItem(this.STORAGE_KEY) || localStorage.getItem(this.STORAGE_KEY);
    if (!rawData) return null;
    try {
      const session = JSON.parse(rawData) as UserSession;
      sessionStorage.setItem(this.STORAGE_KEY, rawData);
      localStorage.setItem(this.STORAGE_KEY, rawData);
      return session;
    } catch {
      this.logout();
      return null;
    }
  }
}
```

---

### 2.2. Guarda de Autenticación Funcional (`auth.guard.ts`)
Interpreta el estado del servicio reactivo. Si el usuario no ha iniciado sesión, detiene el acceso y genera un `UrlTree` hacia `/login` preservando `returnUrl`.

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirección atómica instantánea
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
```

---

### 2.3. Factoría de Guards de Roles Granulares (`role.guard.ts`)
Cumple con la ampliación de la práctica (Sección 4). Permite proteger rutas parametrizando el rol requerido (`roleGuard('admin')` o `roleGuard('user')`). Si un operador autenticado intenta escribir manualmente `/admin`, es interceptado y redirigido a `/user-dashboard`.

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRole: string): CanActivateFn => {
  return (route, state): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    const currentRole = authService.currentUser()?.role;

    if (currentRole === allowedRole) {
      return true;
    }

    // Redirección forzosa al panel del operador ante acceso indebido a /admin
    if (currentRole === 'user') {
      return router.createUrlTree(['/user-dashboard']);
    }

    return router.createUrlTree(['/admin']);
  };
};
```

---

### 2.4. Enrutamiento Modular y Lazy Loading (`app.routes.ts`)
Conexión de las vistas, protecciones en cadena y carga bajo demanda.

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('admin')],
    loadComponent: () => import('./pages/admin/admin.page').then(m => m.AdminPage),
  },
  {
    path: 'user-dashboard',
    canActivate: [authGuard, roleGuard('user')],
    loadComponent: () => import('./pages/user-dashboard/user-dashboard.page').then(m => m.UserDashboardPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
```

---

## 3. Modelo de Trabajo en Git (Git Flow)

Siguiendo las directrices del tribunal:
1. **Rama `main`**: Contiene exclusivamente versiones cerradas, estables y listas para la evaluación del tribunal.
2. **Rama `develop`**: Rama base de integración diaria de los avances del equipo.
3. **Rama `tarea/control-acceso-guards`**: Rama temporal de trabajo donde se desarrollaron los guards, las vistas y los tests.
4. **Commits Semánticos**: Uso estricto de prefijos `feat:` (nuevas funcionalidades), `fix:` (correcciones) y `docs:` (documentación).

---

## 4. Pruebas y Validación Técnica

| Caso de Prueba | Acción Realizada | Resultado Esperado | Resultado Obtenido |
| :--- | :--- | :--- | :--- |
| **Inicio Web** | Abrir `/` | Muestra "Hola Mundo" y botón al login | ✅ Superado |
| **Login Admin** | Pulsar "Iniciar como Admin" | Toast de éxito y redirección a `/admin` | ✅ Superado |
| **Login Operador**| Pulsar "Iniciar como Operador" | Toast de éxito y redirección a `/user-dashboard` | ✅ Superado |
| **Ataque /admin** | Escribir `/admin` con rol operador | `roleGuard` deniega y redirige a `/user-dashboard` | ✅ Superado |
| **Persistencia URL** | Copiar URL `/admin` a otra pestaña | La sesión se conserva activa sin reloguear | ✅ Superado |
| **Logout** | Pulsar "Cerrar Sesión" | Limpia almacenamiento y redirige a `/login` | ✅ Superado |
