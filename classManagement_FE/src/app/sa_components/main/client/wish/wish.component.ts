import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MAT_DATE_LOCALE, MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { SharedModule } from '../../../../shared/shared.module';
import { CommonModule, DatePipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { ChangeDetectionStrategy } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ClientService } from '../../../../core/services/client/client.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { EmailService } from '../../../../core/services/email/email.service';

export function dateLessThanTodayValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const today = new Date();
    const dob = new Date(control.value);
    return dob >= today ? { 'dateInvalid': true } : null;
  };
}

@Component({
  selector: 'app-wish',
  standalone: true,
  imports: [MatIconModule, MatToolbarModule, CommonModule, MatStepperModule, FormsModule, 
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatOptionModule, MatSelectModule, SharedModule, MatDatepickerModule],
  providers: [provideNativeDateAdapter(), {provide: MAT_DATE_LOCALE, useValue: 'vi-VN'}, DatePipe],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './wish.component.html',
  styleUrl: './wish.component.scss'
})

export class WishComponent implements OnInit {
  firstFormGroup: FormGroup;
  selectedImage: string | ArrayBuffer | null = null;
  fileStore: FileList | null = null;

  secondFormGroup: FormGroup;
  subjects: string[] = [];

  thirdFormGroup: FormGroup;
  teachers: string[] = [];

  constructor(private _formBuilder: FormBuilder, private clientService: ClientService, private router: Router, private emailService: EmailService, private datePipe: DatePipe) {
    this.firstFormGroup = this._formBuilder.group({
      firstName: ['', Validators.required],
      surname: [''],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email], [this.emailService.validate.bind(this.emailService)], [this.emailService.validateWishList.bind(this.emailService)]],
      dob: ['', [Validators.required, dateLessThanTodayValidator()]],
      phone: ['', [Validators.required, Validators.pattern('^[- +()0-9]{10}$')]],
      address: ['', Validators.required],
      image: ['', Validators.required]
    });

    this.secondFormGroup = this._formBuilder.group({
      subjects: ['', Validators.required],
    });

    this.thirdFormGroup = this._formBuilder.group({
      teachers: ['', Validators.required],
    });
  }

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

  handleFileInputChange(l: FileList | null): void {
    this.fileStore = l;
    if (l) {
      const f = l[0];
      const count = l.length > 1 ? `(+${l.length - 1} files)` : "";
      this.firstFormGroup.patchValue({
        image: `${f.name}${count}`
      });
    } else {
      this.firstFormGroup.patchValue({
        image: ''
      });
    }
  }

  ngOnInit(): void {
    this.loadSubjects();
    this.onCourseChange();
  }

  loadSubjects(): void {
    this.clientService.getAvailableSubjects().subscribe((data) => {
      this.subjects = data;
    });
  }

  onCourseChange(): void {
    this.secondFormGroup.get('subjects')?.valueChanges.subscribe((subjectName) => {
      if (subjectName) {
        this.clientService.getTeachersBySubject(subjectName).subscribe((data) => {
          this.teachers = data;
        });
      } else {
        this.teachers = [];
      }
    });
  }

  submitRegistration(): void {
    if (this.firstFormGroup.valid) {
      const registrationData = this.firstFormGroup.value;
  
      if (registrationData.dob) {
        registrationData.dob = this.datePipe.transform(registrationData.dob, 'yyyy-MM-dd');
      }
      const requestDto = {
        firstName: registrationData.firstName,
        surName: registrationData.surname,
        lastName: registrationData.lastName,
        email: registrationData.email,
        dob: registrationData.dob,
        phone: registrationData.phone,
        address: registrationData.address,
        subName: this.secondFormGroup.get('subjects')?.value,
        idClassroom: this.extractClassId(this.thirdFormGroup.get('teachers')?.value) 
      };
  
      this.clientService.checkIfRequestExistsForClient(requestDto.email, requestDto.idClassroom!).then((exists) => {
        if (exists) {
          Swal.fire('Thông báo', 'Bạn đã gửi yêu cầu học lớp này trước đó.', 'warning');
        } else {
          this.clientService.requestToClass(requestDto).subscribe((response) => {
            const classId = response; 
            if (classId) {
              this.uploadImage(classId);
            }
          });
        }
      });
    }
  }
  
  extractClassId(classroomName: string | undefined): number | null { 
    if (classroomName) {
      const parts = classroomName.split(' - '); 
      return parts.length > 0 ? Number(parts[0]) : null;
    }
    return null;
  }
  
  uploadImage(classId: number): void {
    if (this.fileStore && this.fileStore[0]) {
      const formData: FormData = new FormData();
      formData.append('file', this.fileStore[0]);
  
      this.clientService.uploadImageToClass(classId, formData).subscribe({
        next: () => {
          Swal.fire('Thành công', 'Gửi nguyện vọng thành công.', 'success');
          this.router.navigate(['/login']);
        },
        error: () => {
          Swal.fire('Lỗi', 'Không thể gửi nguyện vọng.', 'error');
        },
      });
    }
  }
}
