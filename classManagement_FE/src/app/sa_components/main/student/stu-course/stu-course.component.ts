import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import Swal from 'sweetalert2';
import { ClientService } from '../../../../core/services/client/client.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-stu-course',
  standalone: true,
  imports: [MatIconModule, MatToolbarModule, CommonModule, MatStepperModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatOptionModule, MatSelectModule, SharedModule, MatDatepickerModule],
  providers: [provideNativeDateAdapter(), {provide: MAT_DATE_LOCALE, useValue: 'vi-VN'}, DatePipe],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './stu-course.component.html',
  styleUrl: './stu-course.component.scss'
})

export class StuCourseComponent implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  
  currentUser: any;
  subjects: string[] = [];
  teachers: string[] = [];
  selectedImage: string | ArrayBuffer | null = null;

  fileToUpload: File | null = null;
  fileStore: FileList | null = null;

  constructor(private _formBuilder: FormBuilder, private clientService: ClientService, private datePipe: DatePipe, private http: HttpClient) {
    this.currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    this.firstFormGroup = this._formBuilder.group({
      firstName: [this.currentUser?.firstName || ''],
      surname: [this.currentUser?.surname || ''],
      lastName: [this.currentUser?.lastName || ''],
      email: [this.currentUser?.email || ''],
      dob: [this.currentUser?.dob || ''],
      phone: [this.currentUser?.phone || ''],
      address: [this.currentUser?.address || ''],
      image: [this.currentUser?.imageURL || ''],
    });

    this.secondFormGroup = this._formBuilder.group({
      subjects: ['', Validators.required],
    });

    this.thirdFormGroup = this._formBuilder.group({
      teachers: ['', Validators.required],
    });
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
    if (this.thirdFormGroup.valid) {
      const registrationData = this.firstFormGroup.value;

      if (registrationData.dob) {
        registrationData.dob = this.datePipe.transform(registrationData.dob, 'yyyy-MM-dd');
      }      
      
      const requestDto = {
        idStudent: this.currentUser.id,
        firstName: registrationData.firstName,
        surName: registrationData.surname,
        lastName: registrationData.lastName,
        email: registrationData.email,
        dob: registrationData.dob,
        phone: registrationData.phone,
        address: registrationData.address,
        imgUrlRequest: registrationData.image,
        subName: this.secondFormGroup.get('subjects')?.value,
        idClassroom: this.extractClassId(this.thirdFormGroup.get('teachers')?.value) 
      };

      this.checkIfRequestExists(this.currentUser.id, requestDto.idClassroom!).then((exists) => {
        if (exists) {
          Swal.fire('Thông báo', 'Bạn đã gửi yêu cầu trước đó.', 'warning');
        } else {
          this.clientService.requestToClass(requestDto).subscribe({
            next: () => {
              Swal.fire('Thành công', 'Yêu cầu của bạn đã được gửi.', 'success');
            },
            error: () => {
              Swal.fire('Lỗi', 'Không thể gửi yêu cầu.', 'error');
            },
          });
        }
      });
    }
  }
  
  checkIfRequestExists(studentId: number, classroomId: number): Promise<boolean> {
    const apiUrl = `http://localhost:8081/api/student/isExistingRequestInWishList?studentId=${studentId}&classroomId=${classroomId}`;
    return this.http
      .get<boolean>(apiUrl).toPromise()
      .then((response) => response || false) // Nếu không có phản hồi, trả về false
      .catch(() => false); // Xử lý lỗi, trả về false
  }
  

  extractClassId(classroomName: string | undefined): number | null { 
    if (classroomName) {
      const parts = classroomName.split(' - '); 
      return parts.length > 0 ? Number(parts[0]) : null;
    }
    return null;
  }
}