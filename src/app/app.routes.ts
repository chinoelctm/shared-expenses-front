import { Routes } from '@angular/router';
import { anonimoGuard, sesionGuard } from './core/guards/sesion.guard';

export const routes: Routes = [
    {
        path: 'login',
        canActivate: [anonimoGuard],
        loadComponent: () => import('./modulos/login/login.component').then((c) => c.LoginComponent),
    },

    {
        path: '',
        pathMatch: 'full',
        canActivate: [sesionGuard],
        loadComponent: () => import('./modulos/planilla-gastos/planilla-gastos.component').then((c) => c.PlanillaGastosComponent),
    },

    {
        path: 'personales',
        canActivate: [sesionGuard],
        loadComponent: () => import('./modulos/gastos-personales/gastos-personales.component').then((c) => c.GastosPersonalesComponent),
    },

    {
        path: '**',
        redirectTo: '',
    },
];
