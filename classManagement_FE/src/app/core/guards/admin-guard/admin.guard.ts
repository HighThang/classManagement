import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { map } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.getCurrentUser().pipe(
    map((res) => {
      if (res.email) {
        return true;
      } else {
        authService.logout();
        return router.createUrlTree(['/login']);
      }
    })
  );
};
