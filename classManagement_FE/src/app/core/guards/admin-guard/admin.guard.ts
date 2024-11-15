import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import Swal from 'sweetalert2';
import { catchError, map, of } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router)
debugger
  if (authService.hasToken()) {
    return authService.setCurrentUser().pipe(
      map(() => {
        if (authService.isAdminLoggedIn()) {
          return true;
        } else {
          router.navigateByUrl('/home');
  
          const Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
          Toast.fire({
            icon: 'warning',
            title: 'Bạn không có quyền truy cập!',
          });
  
          return false;
        }
      }),
      catchError(() => {
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('currentUser')
        window.location.reload();

        return of(false);
      })
    );
  }

  router.navigateByUrl('/home');
  
  const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
  Toast.fire({
    icon: 'warning',
    title: 'Bạn không có quyền truy cập!',
  });
  
  return false;
};
