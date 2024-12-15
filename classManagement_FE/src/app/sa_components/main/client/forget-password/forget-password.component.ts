import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../../../shared/shared.module';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormsModule, FormControl, FormGroupDirective, NgForm, AbstractControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import Swal from 'sweetalert2';
import { ForgetPassService } from '../../../../core/services/forget-pass/forget-pass.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    return !!(form?.errors?.['mismatch'] && control?.touched);
  }
}

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule, SharedModule, 
    MatInputModule, FormsModule, MatCheckboxModule, MatProgressSpinnerModule, RouterModule, MatDialogModule, MatFormFieldModule,],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss'
})
export class ForgetPasswordComponent implements OnInit{
  forgetPasswordForm!: FormGroup;
  verifyCodeForm!: FormGroup;
  isLoading = false;
  matcher = new MyErrorStateMatcher();

  @ViewChild('dialogTemplate') dialogTemplate: any;

  hide = signal(true);

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  constructor(
    private fb: FormBuilder,
    private forgetPassService: ForgetPassService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.forgetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.verifyCodeForm = this.fb.group({
      code: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validator: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: AbstractControl) {
    return control.get('newPassword')?.value === control.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  onSubmitEmail(): void {
    if (this.forgetPasswordForm.invalid) return;

    this.isLoading = true;
    const email = this.forgetPasswordForm.value.email;

    this.forgetPassService.sendForgotPasswordEmail(email).subscribe({
      next: (res) => {
        if (res.success) {
          this.isLoading = false;
          this.openDialog();
          this.showToast('success', 'Gửi mã xác thực thành công');
        }
        else this.showToast('error', 'Gửi mail không thành công');

      },
      error: () => {
        this.isLoading = false;
        this.showToast('error', 'Có lỗi xảy ra khi gửi mail');
      },
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(this.dialogTemplate, {
      width: '33%', maxHeight: '50vh'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.verifyCodeForm.reset();
    });
  }

  onSubmitVerification(): void {
    if (this.verifyCodeForm.invalid) return;

    const email = this.forgetPasswordForm.value.email;
    const { code, newPassword } = this.verifyCodeForm.value;

    this.isLoading = true;
    this.forgetPassService.resetPassword({email, code, newPassword}).subscribe({
      next: (res) => {
        if (res.success) {
          this.isLoading = false;
          this.dialog.closeAll();
          this.router.navigate(['/login']);
          this.showToast('success', 'Thay đổi mật khẩu thành công');
        }
        else this.showToast('error', 'Thay đổi mật khẩu không thành công');
      },
      error: () => {
        this.isLoading = false;
        this.showToast('error', 'Có lỗi xảy ra khi đổi mật khẩu');
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