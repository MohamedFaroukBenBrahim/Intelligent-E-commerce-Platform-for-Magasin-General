import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token || role !== 'ROLE_ADMIN') {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
