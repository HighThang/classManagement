import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import {
  ClassDetails,
  ClassDetailsService,
} from '../../../../core/services/class-detail/class-detail.service';
import Swal from 'sweetalert2';
import {
  Classroom,
  ClassroomService,
} from '../../../../core/services/classroom/classroom.service';
import { trigger, transition, style, animate } from '@angular/animations';
import {
  ApexChart,
  ApexAxisChartSeries,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
} from "ng-apexcharts";

import { MatCheckboxModule } from '@angular/material/checkbox';
import { ExamScoreService } from '../../../../core/services/exam-score/exam-score.service';
import { FeeService, TutorFeeDetailDto } from '../../../../core/services/fee/fee.service';

@Component({
  selector: 'app-stu-fee',
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
    MatCheckboxModule,
  ],
  templateUrl: './stu-fee.component.html',
  styleUrl: './stu-fee.component.scss',
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
export class StuFeeComponent implements OnInit, AfterViewInit {
  formGroup!: FormGroup;

  activeClassrooms: Classroom[] = [];
  deletedClassrooms: Classroom[] = [];  
  showDetails: boolean = false;

  classId!: number;
  classDetails!: ClassDetails;

  displayedColumns1: string[] = ['year', 'month', 'totalNumberOfClasses', "numberOfClassesAttended", "lessonPrice", "feeAmount", "feeSubmitted", "feeNotSubmitted", "createdDate"];
  dataSource1 = new MatTableDataSource<TutorFeeDetailDto>();

  @ViewChild('paginator1') paginator1!: MatPaginator;
  @ViewChild('sort1') sort1!: MatSort;

  constructor(
    private classDetailsService: ClassDetailsService,
    private classroomService: ClassroomService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private router: Router,
    private feeService: FeeService
  ) {}

  ngOnInit(): void {
    const userData = sessionStorage.getItem('currentUser');
    const user = JSON.parse(userData!);
    const studentId = user.id;

    const currentClassId = sessionStorage.getItem('currentClassId');
    if (currentClassId) this.classId = Number(currentClassId);

    this.formGroup = this.fb.group({
      classroomId: [this.classId || null],
    });

    this.classDetails = {
      id: 0,
      subjectName: '',
      createdDate: '',
      note: '',
      className: '',
      teacherName: '',
    };

    this.loadClassrooms();

    if (this.classId) {
      this.checkPermissionAndLoadData(studentId, this.classId);
    }

    this.formGroup.get('classroomId')?.valueChanges.subscribe((selectedClassId) => {
      if (selectedClassId) {
        sessionStorage.setItem('currentClassId', selectedClassId.toString());
        this.classId = selectedClassId;
        this.checkPermissionAndLoadData(studentId, this.classId);
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource1.paginator = this.paginator1;
    this.dataSource1.sort = this.sort1;
  }

  loadClassrooms(): void {
    this.classroomService.getClassroomsForStudent({}).subscribe({
      next: (response) => {
        const activeData = response
          .filter((item: any) => item.active === true && item.deleted === false)
          .map((item: any) => (item.classroom));
  
        const inactiveData = response
          .filter((item: any) => item.active === false && item.deleted === true)
          .map((item: any) => (item.classroom));

        this.activeClassrooms = activeData; 
        this.deletedClassrooms = inactiveData; 
      },
      error: () => {
        this.showToast('error', 'Lỗi khi tải dữ liệu lớp học')
      },
    });
  }

  checkPermissionAndLoadData(studentId: number, classId: number): void {
    this.classDetailsService
      .checkPermissionForStudent(studentId, classId)
      .subscribe({
        next: (hasPermission) => {
          if (hasPermission) {
            sessionStorage.setItem('currentClassId', classId.toString());
            this.showDetails = true;
            this.loadClassDetails(classId);
            this.loadTutorFeeForStudent(classId);
          } else {
            this.showToast('error', 'Bạn không có quyền truy cập lớp này');
            sessionStorage.removeItem('currentClassId');
            this.showDetails = false;
            this.router.navigate(['student/class']);
          }
        },
        error: () => {
          this.showToast('error', 'Có lỗi xảy ra khi kiểm tra quyền');
          this.showDetails = false;
          this.router.navigate(['student/class']);
        },
      });
  }

  loadClassDetails(classId: number): void {
    this.classDetailsService.getClassDetails(classId).subscribe((data) => {
      this.classDetails = data;
    });
  }

  applyFilter1(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource1.filter = filterValue.trim().toLowerCase();
  }

  private loadTutorFeeForStudent(classId: number): void {
    this.feeService.getTutorFeeForStudent(classId).subscribe({
      next: (response: any) => {
        const activeData = response
          .map((item: TutorFeeDetailDto) => ({
            year: item.year,
            month: item.month,
            totalNumberOfClasses: item.totalNumberOfClasses, 
            numberOfClassesAttended: item.numberOfClassesAttended, 
            lessonPrice: item.lessonPrice, 
            feeAmount: item.feeAmount, 
            feeSubmitted: item.feeSubmitted, 
            feeNotSubmitted: item.feeNotSubmitted, 
            createdDate: item.time
          }));
  
        this.dataSource1.data = activeData;

        console.log(this.dataSource1.data)
      },
      error: () => {
        this.showToast('error', 'Lỗi khi tải dữ liệu');
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
