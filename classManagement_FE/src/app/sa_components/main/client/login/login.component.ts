import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../../../shared/shared.module';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { ITheme } from '../../../../core/interfaces/theme.interface';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule, SharedModule, MatInputModule, FormsModule, MatCheckboxModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  public currentTheme!: ITheme;
  
  loginForm: FormGroup;
  passwordFieldType: 'password' | 'text' = 'password';

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['admin', Validators.required],
      password: ['123456', Validators.required],
      rememberMe: true,
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;      

      this.authService
        .authenticate(username, password)
        .pipe(
          catchError(() => {
            return of(null);
          })
        )
        .subscribe((response) => {
          if (response) {
            this.authService.setCurrentUser().subscribe(() => {
              if (this.authService.isAdminLoggedIn()) {
                this.router.navigateByUrl('admin');
              } else if (this.authService.isTeacherLoggedIn()) {
                this.router.navigateByUrl('teacher');
              } else if (this.authService.isStudentLoggedIn()) {
                this.router.navigateByUrl('student');
              }
            });

            const Toast = Swal.mixin({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
            });
            Toast.fire({
              icon: 'success',
              title: 'Đăng nhập thành công!',
            });
          }
        });
    }
  }
}
