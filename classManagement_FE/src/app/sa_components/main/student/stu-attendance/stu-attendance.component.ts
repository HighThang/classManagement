import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import {
  ClassDetails,
  ClassDetailsService,
  ScheduleData,
} from '../../../../core/services/class-detail/class-detail.service';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import {
  Classroom,
  ClassroomService,
} from '../../../../core/services/classroom/classroom.service';
import { trigger, transition, style, animate } from '@angular/animations';
import {
  ChartComponent,
  ApexChart,
  ApexLegend,
  ApexDataLabels,
  ApexResponsive,
} from 'ng-apexcharts';
import {
  Attendance,
  ClassAttendanceService,
} from '../../../../core/services/class-attendance/class-attendance.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import saveAs from 'file-saver';

export type ChartOptions = {
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  responsive: ApexResponsive[];
};

@Component({
  selector: 'app-stu-attendance',
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
    ChartComponent,
    MatCheckboxModule,
  ],
  templateUrl: './stu-attendance.component.html',
  styleUrl: './stu-attendance.component.scss',
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
export class StuAttendanceComponent implements OnInit, AfterViewInit {
  formGroup!: FormGroup;

  activeClassrooms: Classroom[] = [];
  deletedClassrooms: Classroom[] = [];
  showDetails: boolean = false;

  classId!: number;
  classDetails!: ClassDetails;

  displayedColumns1: string[] = [ 'day', 'dayInWeek', 'periodInDay', 'attend' ];
  dataSource1 = new MatTableDataSource<any>();

  @ViewChild('paginator1') paginator1!: MatPaginator;
  @ViewChild('sort1') sort1!: MatSort;

  chartOptions: Partial<ChartOptions> = {
    chart: {
      width: 400,
      type: 'pie',
    },
    labels: ['Đi học', 'Vắng học'],
    colors: ['rgb(0, 227, 150)', 'rgb(255, 69, 96)'],
    legend: {
      position: 'bottom',
    },
    dataLabels: {
      enabled: true,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };
  chartSeries: number[] = [0, 0];
  totalCount: number = 0;

  constructor(
    private classDetailsService: ClassDetailsService,
    private classroomService: ClassroomService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private router: Router,
    private classAttendance: ClassAttendanceService
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
      teacherEmail: '',
      teacherPhone: ''
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
    this.classDetailsService.checkPermissionForStudent(studentId, classId).subscribe({
      next: (hasPermission) => {
        if (hasPermission) {
          sessionStorage.setItem('currentClassId', classId.toString());
          this.showDetails = true;
          this.loadClassDetails(classId);
          this.loadAttendanceResultForStudent(classId);
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

  isToday(date: string | Date): boolean {
    if (!date) return false;
    const today = new Date();
    const rowDate = new Date(date);
  
    return (
      rowDate.getDate() === today.getDate() &&
      rowDate.getMonth() === today.getMonth() &&
      rowDate.getFullYear() === today.getFullYear()
    );
  }

  private loadAttendanceResultForStudent(classId: number): void {
    this.classAttendance.getClassAttendanceForStudent(classId).subscribe({
      next: (response: any) => {
        const activeData = response.content.map((item: any) => ({
          day: item.day,
          dayInWeek: this.getDayOfWeek(item.day),
          periodInDay: this.mapPeriodInDay(item.classPeriod),
          isAttended: item.attended
        }));

        this.dataSource1.data = activeData;
        this.totalCount = response.content.length;
        this.updateChartData();
      },
      error: () => {
        this.showToast('error', 'Lỗi khi tải dữ liệu')
      },
    });
  }

  private mapPeriodInDay(periodInDay: string): string {
    const periodMap: { [key: string]: string } = {
      PERIOD_1: 'Ca học 1',
      PERIOD_2: 'Ca học 2',
      PERIOD_3: 'Ca học 3',
      PERIOD_4: 'Ca học 4',
      PERIOD_5: 'Ca học 5',
      PERIOD_6: 'Ca học 6',
    };
    return periodMap[periodInDay] || periodInDay;
  }

  private getDayOfWeek(dateString: string): string {
    const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    
    const date = new Date(dateString);
  
    const dayIndex = date.getDay();
  
    return daysOfWeek[dayIndex];
  }

  updateChartData() {
    const attendedCount = this.dataSource1.data.filter((row) => row.isAttended).length;
    const absentCount = this.totalCount - attendedCount;
    this.chartSeries = [attendedCount, absentCount];
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
