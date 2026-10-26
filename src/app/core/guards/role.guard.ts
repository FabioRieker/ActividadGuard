import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Factoría de guards que valida si el usuario cuenta con el rol requerido
 */
export const roleGuard = (allowedRole: string): CanActivateFn => {
  return (route, state): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Si no está autenticado, redirigir a la pantalla de login
    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    const currentRole = authService.currentUser()?.role;

    // Si cuenta con el rol permitido, dar paso
    if (currentRole === allowedRole) {
      return true;
    }

    // Si un usuario con rol 'user' intenta acceder a /admin (o rol no autorizado),
    // denegar el acceso y redirigirlo a /user-dashboard
    if (currentRole === 'user') {
      return router.createUrlTree(['/user-dashboard']);
    }

    // Si un usuario con rol 'admin' accede a una ruta restringida a otro rol,
    // redirigir a su panel /admin
    if (currentRole === 'admin') {
      return router.createUrlTree(['/admin']);
    }

    return router.createUrlTree(['/login']);
  };
};
