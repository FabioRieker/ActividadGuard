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
    canActivate: [authGuard, roleGuard('admin')], // Protección mediante Functional Guard y validación de rol
    loadComponent: () => import('./pages/admin/admin.page').then(m => m.AdminPage),
  },
  {
    path: 'user-dashboard',
    canActivate: [authGuard, roleGuard('user')], // Ruta protegida para rol 'user' (operador)
    loadComponent: () => import('./pages/user-dashboard/user-dashboard.page').then(m => m.UserDashboardPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
