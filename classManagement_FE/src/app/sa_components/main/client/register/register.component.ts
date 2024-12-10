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

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    return !!(form?.errors?.['mismatch'] && control?.touched);
  }
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

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  verificationForm!: FormGroup;
  @ViewChild('dialogTemplate') dialogTemplate: any;

  constructor(private fb: FormBuilder, private datePipe: DatePipe, private emailService: EmailService, private dialog: MatDialog, private http: HttpClient, private router: Router) {}

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
      phone: ['', [Validators.required, Validators.pattern('[- +()0-9]+')]],
      dob: ['', Validators.required],
      address: ['', Validators.required],
      business: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: AbstractControl) {
    return control.get('password')?.value === control.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.isLoading = true; // Bắt đầu loading
      this.email = this.registerForm.get('email')?.value;

      this.http.post(`http://localhost:8081/api/auth/send-code?email=${encodeURIComponent(this.email)}`, {}).subscribe({
        next: () => {
          this.isLoading = false; // Kết thúc loading
          this.dialog.open(this.dialogTemplate);
        },
        error: () => {
          this.isLoading = false; // Kết thúc loading
          Swal.fire('Lỗi', 'Không thể gửi email. Vui lòng thử lại.', 'error');
        },
      });
    }
  }

  verifyCode() {
    this.isLoading = true; // Bắt đầu loading
    this.verificationCode = this.verificationForm.get('verificationCode')?.value;

    this.http.get<boolean>(`http://localhost:8081/api/auth/verify-code?email=${encodeURIComponent(this.email)}&code=${this.verificationCode}`).subscribe({
      next: (isValid) => {
        if (isValid) {
          this.createAccount();
        } else {
          this.isLoading = false; // Kết thúc loading
          Swal.fire('Lỗi', 'Mã xác minh không chính xác.', 'error');
        }
      },
      error: () => {
        this.isLoading = false; // Kết thúc loading
        Swal.fire('Lỗi', 'Không thể xác minh mã. Vui lòng thử lại.', 'error');
      },
    });
  }

  createAccount() {
    const formData = this.registerForm.getRawValue();

    formData.username = formData.email;

    if (formData.dob) {
      formData.dob = this.datePipe.transform(formData.dob, 'yyyy-MM-dd');
    }

    this.http.post('http://localhost:8081/api/auth/signup', formData).subscribe({
      next: () => {
        this.isLoading = false; // Kết thúc loading
        Swal.fire('Thành công', 'Đã gửi yêu cầu tạo tài khoản.', 'success');
        this.dialog.closeAll();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.isLoading = false; // Kết thúc loading
        Swal.fire('Lỗi', 'Không thể tạo tài khoản.', 'error');
      },
    });
  }
}
