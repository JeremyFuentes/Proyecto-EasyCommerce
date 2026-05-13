import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');
  const tipoLogin = localStorage.getItem('tipoLogin');

  if (token && rol === 'Administrador' && tipoLogin === 'admin') {
    return true;
  }

  router.navigate(['/admin/login']);
  return false;
};