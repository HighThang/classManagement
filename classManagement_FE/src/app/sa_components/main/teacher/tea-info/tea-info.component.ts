import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../../../shared/shared.module';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { UserService } from '../../../../core/services/user/user.service';
import Swal from 'sweetalert2';
import { UserResponse } from '../../../../core/services/user/user.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { ImageService } from '../../../../core/services/image/image.service';

export function dateLessThanTodayValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const today = new Date();
    const dob = new Date(control.value);
    return dob >= today ? { 'dateInvalid': true } : null;
  };
}

@Component({
  selector: 'app-tea-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule, SharedModule, MatFormFieldModule, MatInputModule, MatDatepickerModule],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'vi-VN' },
    DatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './tea-info.component.html',
  styleUrl: './tea-info.component.scss',
})
export class TeaInfoComponent implements OnInit {
  userInfoForm!: FormGroup;
  isEditing = false;
  selectedImage: string | null = null;
  file_store: FileList | null = null;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private userService: UserService,
    private authService: AuthService,
    private imageService: ImageService
  ) {
    this.userInfoForm = this.fb.group({
      firstName: [{ value: '', disabled: true }, [Validators.required]],
      surname: [{ value: '', disabled: true }],
      lastName: [{ value: '', disabled: true }, [Validators.required]],
      email: [{ value: '', disabled: true }],
      phone: [{ value: '', disabled: true }, [Validators.required, Validators.pattern('^[- +()0-9]{10}$')]],
      role: [{ value: '', disabled: true }],
      dob: [{ value: '', disabled: true }, [Validators.required, dateLessThanTodayValidator()]],
      address: [{ value: '', disabled: true }, Validators.required],
      business: [{ value: '', disabled: true }, Validators.required],
      imageURL: [{ value: '', disabled: true }],
    });
  }

  ngOnInit(): void {
    this.getUserInfo();
  }

  getUserInfo(): void {
    this.authService.setCurrentUser().subscribe(
      (response: UserResponse) => {
        this.userInfoForm.patchValue(response);
        this.loadImage(response.imageURL);
      },
      () => {
        localStorage.removeItem('accessToken');
      }
    );
  }

  loadImage(imagePath: string | null): void {
    if (imagePath) {
      this.imageService.getImage().subscribe(
        (imageBlob: Blob) => {
          const imageUrl = URL.createObjectURL(imageBlob);
          this.selectedImage = imageUrl;
        },
        () => {
          this.selectedImage = null;
        }
      );
    }
  }

  enableEdit(): void {
    this.isEditing = true;
    this.userInfoForm.enable();
    this.userInfoForm.get('role')?.disable();
    this.userInfoForm.get('email')?.disable();
  }

  disableEdit(): void {
    this.isEditing = false;
    this.getUserInfo();
    this.userInfoForm.disable();
  }

  saveInfo(): void {
    if (this.userInfoForm.valid) {
      const formData = this.userInfoForm.getRawValue();

      if (formData.dob) {
        formData.dob = this.datePipe.transform(formData.dob, 'yyyy-MM-dd');
      }

      if (this.file_store && this.file_store[0]) this.uploadImage();
      this.updateUserInfo(formData);
    }
  }

  private updateUserInfo(formData: any): void {
    this.userService.updateUserInfo(formData).subscribe(
      (response) => {
        this.userInfoForm.patchValue(response);
        this.isEditing = false;
        this.userInfoForm.disable();

        this.authService.updateUser(this.userInfoForm.value);

        Swal.fire({
          icon: 'success',
          title: 'Cập nhật thông tin thành công',
          position: 'bottom-end',
          toast: true,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      },
      () => {
        Swal.fire({
          icon: 'error',
          title: 'Không thể cập nhật thông tin',
          position: 'bottom-end',
          toast: true,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    );
  }

  uploadImage(): void {
    if (this.file_store && this.file_store[0]) {
      const formData: FormData = new FormData();
      formData.append('file', this.file_store[0]);

      this.userService.uploadImageToUser(formData).subscribe(
        (response: boolean) => {
          this.getUserInfo();
          if (!response) {
            Swal.fire({
              icon: 'error',
              title: 'Không thể tải ảnh lên',
              position: 'bottom-end',
              toast: true,
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false,
            });
          }
        },
        () => {
          Swal.fire({
            icon: 'error',
            title: 'Có lỗi xảy ra khi tải ảnh',
            position: 'bottom-end',
            toast: true,
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      );
    }
  }

  handleFileInputChange(files: FileList | null): void {
    this.file_store = files;
    if (files && files[0]) {
      const file = files[0];
      const count = files.length > 1 ? `(+${files.length - 1} files)` : '';
      this.userInfoForm.patchValue({
        imageURL: `${file.name}${count}`,
      });
    } else {
      this.userInfoForm.patchValue({
        imageURL: '',
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file: File = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.selectedImage = reader.result as string;
      };

      reader.readAsDataURL(file);
      this.file_store = input.files;
    }
  }
}