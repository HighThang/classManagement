import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../../../shared/shared.module';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ErrorStateMatcher, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { EmailService } from '../../../../core/services/email/email.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ValidatorFn } from '@angular/forms';
import { RegisterService } from '../../../../core/services/register/register.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    return !!(form?.errors?.['mismatch'] && control?.touched);
  }
}

export function dateLessThanTodayValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const today = new Date();
    const dob = new Date(control.value);
    return dob >= today ? { 'dateInvalid': true } : null;
  };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule, SharedModule, MatInputModule,
    MatFormFieldModule, MatInputModule, MatDatepickerModule, MatDialogModule, MatProgressSpinnerModule],
  providers: [provideNativeDateAdapter(), {provide: MAT_DATE_LOCALE, useValue: 'vi-VN'}, DatePipe],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  passwordFieldType: string = 'password';
  matcher = new MyErrorStateMatcher();
  email: string = '';
  verificationCode: string = '';
  isLoading = false;
  hide = signal(true);
  verificationForm!: FormGroup;

  @ViewChild('dialogTemplate') dialogTemplate: any;

  constructor(private fb: FormBuilder, private datePipe: DatePipe, private emailService: EmailService, 
    private dialog: MatDialog, private router: Router, private registerService: RegisterService) {}

  ngOnInit(): void {
    this.initializeForm();
    this.verificationForm = this.fb.group({
      verificationCode: ['', Validators.required],
    });
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      surname: [''],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email], [this.emailService.validate.bind(this.emailService)],],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('^[- +()0-9]{10}$')]],
      dob: ['', [Validators.required, dateLessThanTodayValidator()]],
      address: ['', Validators.required],
      business: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: AbstractControl) {
    return control.get('password')?.value === control.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.email = this.registerForm.get('email')?.value;

      this.registerService.sendCode(this.email).subscribe({
        next: () => {
          this.isLoading = false;
          this.dialog.open(this.dialogTemplate);
        },
        error: () => {
          this.isLoading = false;
          this.showToast('error', 'Không thể gửi mã xác minh.');
        },
      });
    }
  }

  verifyCode() {
    this.isLoading = true;
    this.verificationCode = this.verificationForm.get('verificationCode')?.value;

    this.registerService.verifyCode(this.email, this.verificationCode).subscribe({
      next: (isValid) => {
        if (isValid) {
          this.createAccount();
        } else {
          this.isLoading = false;
          this.showToast('error', 'Mã xác minh không chính xác.');
        }
      },
      error: () => {
        this.isLoading = false;
        this.showToast('error', 'Không thể xác minh mã.');
      },
    });
  }

  createAccount() {
    const formData = this.registerForm.getRawValue();
    formData.username = formData.email;

    if (formData.dob) {
      formData.dob = this.datePipe.transform(formData.dob, 'yyyy-MM-dd');
    }

    this.registerService.createAccount(formData).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire('Thành công', 'Gửi yêu cầu tạo tài khoản thành công.', 'success');
        this.dialog.closeAll();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Lỗi', 'Không thể gửi yêu cầu tạo tài khoản.', 'error');
      },
    });
  }

  showToast(icon: 'success' | 'error' | 'info' | 'warning', title: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
    Toast.fire({
      icon: icon,
      title: title,
    });
  }
}
