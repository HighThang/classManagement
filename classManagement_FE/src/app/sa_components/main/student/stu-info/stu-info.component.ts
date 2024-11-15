import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../../../shared/shared.module';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { UserService } from '../../../../core/services/user/user.service';
import Swal from 'sweetalert2';
import { UserResponse } from '../../../../core/interfaces/response.interface';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-stu-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule, SharedModule, MatFormFieldModule, MatInputModule, MatDatepickerModule],
  providers: [provideNativeDateAdapter(), {provide: MAT_DATE_LOCALE, useValue: 'vi-VN'}, DatePipe],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './stu-info.component.html',
  styleUrl: './stu-info.component.scss'
})
export class StuInfoComponent implements OnInit {
  registerForm!: FormGroup;
  isEditing = false;

  constructor(private fb: FormBuilder, private datePipe: DatePipe, private userService: UserService, private authService: AuthService) {
    this.registerForm = this.fb.group({
      firstName: [{value: '', disabled: true}, [Validators.required]],
      surname: [{value: '', disabled: true}],
      lastName: [{value: '', disabled: true}, [Validators.required]],
      email: [{value: '', disabled: true}],
      phone: [{value: '', disabled: true}, [Validators.required, Validators.pattern('[- +()0-9]+')]],
      role: [{value: '', disabled: true}],
      dob: [{value: '', disabled: true}, Validators.required],
      address: [{value: 'test', disabled: true}, Validators.required],
      image: [{value: '', disabled: true}, Validators.required],
    })
  }

  ngOnInit(): void {
    this.getUserInfo();
  }

  getUserInfo(): void {
    const userData = sessionStorage.getItem('currentUser');

    if (userData) 
      this.registerForm.patchValue(JSON.parse(userData) as UserResponse);
    else {
      this.authService.setCurrentUser().subscribe(
        (response: UserResponse) => {
          this.registerForm.patchValue(response);
        },
        (error) => {
          localStorage.removeItem('accessToken');
        }
      );
    }
  }

  enableEdit() {
    this.isEditing = true;
    this.registerForm.enable();
    this.registerForm.get('role')?.disable();
    this.registerForm.get('email')?.disable();
  }

  disableEdit(): void {
    this.isEditing = false;
    this.getUserInfo();
    this.registerForm.disable();
  }

  saveInfo(): void {
    if (this.registerForm.valid) {      
      const formData = this.registerForm.getRawValue();

      if (formData.dob) {
        formData.dob = this.datePipe.transform(formData.dob, 'yyyy-MM-dd');
      }

      this.userService.updateUserInfo(formData).subscribe(
        (response) => {
          this.registerForm.patchValue(response);
          this.isEditing = false;
          this.registerForm.disable();

          this.authService.updateUser(this.registerForm.value);

          const Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
          Toast.fire({
            icon: 'success',
            title: 'Cập nhật thông tin thành công',
          });
        },
        (error) => {
          console.error(error);
          const Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
          Toast.fire({
            icon: 'error',
            title: 'Không thể cập nhật thông tin',
          });
        }
      );
    }
  }

  // Nhập ảnh
  selectedImage: string | ArrayBuffer | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file: File = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.selectedImage = reader.result;
      };

      reader.readAsDataURL(file);
    }
  }

  file_store: FileList | null = null;

  handleFileInputChange(l: FileList | null): void {
    this.file_store = l;
    if (l) {
      const f = l[0];
      const count = l.length > 1 ? `(+${l.length - 1} files)` : "";
      this.registerForm.patchValue({
        image: `${f.name}${count}`
      });
    } else {
      this.registerForm.patchValue({
        image: ''
      });
    }
  }
}
