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
import { CheckJoinClassRequestService } from '../../../../core/services/check-join-class-request/check-join-class-request.service';
import { UserService } from '../../../../core/services/user/user.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-stu-course',
  standalone: true,
  imports: [MatIconModule, MatToolbarModule, CommonModule, MatStepperModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, 
    MatButtonModule, MatOptionModule, MatSelectModule, SharedModule, MatDatepickerModule],
  providers: [
    provideNativeDateAdapter(), 
    {provide: MAT_DATE_LOCALE, useValue: 'vi-VN'}, 
    DatePipe
  ],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './stu-course.component.html',
  styleUrl: './stu-course.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms ease-out', style({ opacity: 0 }))]),
    ]),
  ],
})

export class StuCourseComponent implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  
  currentUser: any;
  subjects: string[] = [];
  teachers: string[] = [];

  classDetails: any[] = [];
  showDetails: boolean = false;
  selectedTeacher: any;

  constructor(
    private fb: FormBuilder, 
    private clientService: ClientService, 
    private datePipe: DatePipe, 
    private checkJoinClassRequestService: CheckJoinClassRequestService,
    private userService: UserService
  ) {
    this.firstFormGroup = this.fb.group({
      firstName: [''],
      surname: [''],
      lastName: [''],
      email: [''],
      dob: [''],
      phone: [''],
      address: [''],
      image: [''],
    });

    this.secondFormGroup = this.fb.group({
      subjects: ['', Validators.required],
    });

    this.thirdFormGroup = this.fb.group({
      teachers: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.userService.getUserInfo().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.firstFormGroup.patchValue({
          firstName: user.firstName,
          surname: user.surname,
          lastName: user.lastName,
          email: user.email,
          dob: user.dob,
          phone: user.phone,
          address: user.address,
          image: user.imageURL,
        });
      },
      error: () => {
        this.showToast('error', 'Không thể tải thông tin người dùng.');
      }
    });

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
          this.showDetails = false;
          this.selectedTeacher = null;
          this.teachers = data.map(item => item.basicInfo);
          this.classDetails = data.map(item => item.additionalInfo);
        });
      } else {
        this.teachers = [];
        this.classDetails = [];
      }
    });
  }

  onTeacherSelect(teacher: string): void {
    if (teacher === '') {
      this.showDetails = false;
      this.selectedTeacher = null;
    } else {
      this.showDetails = true;
      const index = this.teachers.indexOf(teacher);
      this.selectedTeacher = this.classDetails[index];
    }
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

      this.checkJoinClassRequestService.checkIfRequestExistsForStudent(this.currentUser.id, requestDto.idClassroom!).then((exists) => {
        if (exists) {
          Swal.fire('Thông báo', 'Bạn đã gửi yêu cầu vào lớp này trước đó.', 'warning');
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

  extractClassId(classroomName: string | undefined): number | null { 
    if (classroomName) {
      const parts = classroomName.split(' - '); 
      return parts.length > 0 ? Number(parts[0]) : null;
    }
    return null;
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