import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionStore } from '../state/sesion.store';

/** La planilla solo con sesión: sin ella, al login. */
export const sesionGuard: CanActivateFn = async () => {
  const router = inject(Router);
  return await inject(SesionStore).verificar() ? true : router.createUrlTree(['/login']);
};

/** Con sesión activa no tiene sentido ver el login: a la planilla. */
export const anonimoGuard: CanActivateFn = async () => {
  const router = inject(Router);
  return await inject(SesionStore).verificar() ? router.createUrlTree(['/']) : true;
};
