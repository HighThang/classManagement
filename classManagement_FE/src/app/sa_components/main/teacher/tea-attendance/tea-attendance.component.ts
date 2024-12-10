import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import { ClassDetails, ClassDetailsService } from '../../../../core/services/class-detail/class-detail.service';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Classroom, ClassroomService } from '../../../../core/services/classroom/classroom.service';

@Component({
  selector: 'app-tea-attendance',
  standalone: true,
  imports: [    
    MatTabsModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTableModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatTabsModule,
    MatToolbarModule,
    RouterModule,
    FormsModule,
    MatPaginatorModule,
    SharedModule,
    MatSortModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './tea-attendance.component.html',
  styleUrl: './tea-attendance.component.scss'
})
export class TeaAttendanceComponent implements OnInit{
  formGroup!: FormGroup;
  classrooms: Classroom[] = [];
  
  classId!: number;
  classDetails!: ClassDetails;

  constructor(
    private classDetailsService: ClassDetailsService,
    private classroomService: ClassroomService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userData = sessionStorage.getItem('currentUser');
    const user = JSON.parse(userData!);
    const teacherId = user.id;
  
    const currentClassId = sessionStorage.getItem('currentClassId');
    if (currentClassId)  this.classId = Number(currentClassId);
  
    this.formGroup = this.fb.group({
      classroomId: [this.classId || null],
    });
  
    this.classDetails = {
      id: 0,
      subjectName: '',
      createdDate: '',
      note: '',
      className: '',
    };
  
    this.loadClassrooms();
  
    if (this.classId) {
      this.checkPermissionAndLoadData(teacherId, this.classId);
    } 
    
    this.formGroup.get('classroomId')?.valueChanges.subscribe((selectedClassId) => {
      if (selectedClassId) {
        sessionStorage.setItem('currentClassId', selectedClassId.toString());
        this.classId = selectedClassId;
        this.checkPermissionAndLoadData(teacherId, this.classId);
      }
    });
  }
  
  loadClassrooms(): void {
    this.classroomService.getClassrooms().subscribe((data) => {
      this.classrooms = data;
    });
  }
  
  checkPermissionAndLoadData(teacherId: number, classId: number): void {
    this.classDetailsService.checkPermission(teacherId, classId).subscribe({
      next: (hasPermission) => {
        if (hasPermission) {
          sessionStorage.setItem('currentClassId', classId.toString());
          this.loadClassDetails(classId);
          //
        } else {
          this.showToast('error', 'Bạn không có quyền truy cập lớp này');
          sessionStorage.removeItem('currentClassId');
          this.router.navigate(['teacher/manage_class']);
        }
      },
      error: () => {
        this.showToast('error', 'Có lỗi xảy ra khi kiểm tra quyền');
        this.router.navigate(['teacher/manage_class']);
      },
    });
  }
  
  loadClassDetails(classId: number): void {
    this.classDetailsService.getClassDetails(classId).subscribe((data) => {
      this.classDetails = data;
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
