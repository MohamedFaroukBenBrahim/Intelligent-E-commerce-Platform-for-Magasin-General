import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const RHGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token || role !== 'ROLE_RH') {
    router.navigate(['/login']);
    return false;
  }
  
  return true;
};
