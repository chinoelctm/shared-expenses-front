import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./modulos/planilla-gastos/planilla-gastos.component').then((c) => c.PlanillaGastosComponent),
    },

    {
        path: '**',
        redirectTo: '',
    },
];
