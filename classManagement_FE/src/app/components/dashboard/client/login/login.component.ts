import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../../../shared/shared.module';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ITheme } from '../../../../core/interfaces/theme.interface';
import { ThemeService } from '../../form/header/services/theme.service';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule, SharedModule, MatInputModule],
  providers: [ThemeService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit{
  public currentTheme!: ITheme;
  
  loginForm: FormGroup;
  passwordFieldType: 'password' | 'text' = 'password';

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  constructor(
    private fb: FormBuilder,
    // private authService: AuthService,
    // private router: Router,
    private themeService: ThemeService,
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: false,
    });
  }

  ngOnInit() {
    this.currentTheme = this.themeService.getTheme();
  }

  onLogin() {
    // if (this.loginForm.valid) {
    //   const { username, password, rememberMe } = this.loginForm.value;      
    //   this.authService
    //     .authenticate(username, password, rememberMe)
    //     .pipe(
    //       catchError(() => {
    //         return of(null);
    //       })
    //     )
    //     .subscribe((response) => {
    //       if (response) {
    //         this.router.navigate(['/dashboard']);
    //         const Toast = Swal.mixin({
    //           toast: true,
    //           position: 'bottom-end',
    //           showConfirmButton: false,
    //           timer: 3000,
    //           timerProgressBar: true,
    //           didOpen: (toast) => {
    //             toast.onmouseenter = Swal.stopTimer;
    //             toast.onmouseleave = Swal.resumeTimer;
    //           },
    //         });
    //         Toast.fire({
    //           icon: 'success',
    //           title: 'Login successfully!',
    //         });
    //       }
    //     });
    // }
  }
}
