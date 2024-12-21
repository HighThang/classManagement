import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import Swal from 'sweetalert2';
import { catchError, map, of } from 'rxjs';

export const clientGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router)

  if (authService.hasToken()) {
    return authService.setCurrentUser().pipe(
      map(() => {
        if (authService.isAdminLoggedIn() || authService.isTeacherLoggedIn() || authService.isStudentLoggedIn()) {
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
            title: 'Bạn đã đăng nhập!',
          });
  
          return false;
        } 
        return true;
      }),
      catchError(() => {
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentClassId');
        window.location.reload();
        
        return of(true);
      })
    );
  }
  return true;
};
