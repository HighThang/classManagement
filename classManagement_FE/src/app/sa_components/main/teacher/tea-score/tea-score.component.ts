import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  NgModel,
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
import { Exam, ExamScoreService, ScoreDetail } from '../../../../core/services/exam-score/exam-score.service';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-tea-score',
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
  templateUrl: './tea-score.component.html',
  styleUrl: './tea-score.component.scss',
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
export class TeaScoreComponent implements OnInit, AfterViewInit {
  formGroup!: FormGroup;
  registerForm!: FormGroup;

  classrooms: Classroom[] = [];
  showDetails: boolean = false;

  activeBtn = true;
  isEditing = false;

  classId!: number;
  examName!: string;
  examId!: number;
  classDetails!: ClassDetails;
  examDetail!: Exam;

  displayedColumns1: string[] = ['id', 'examName', 'createdDate', 'edit'];
  dataSource1 = new MatTableDataSource<Exam>();

  displayedColumns11: string[] = ['id', 'email', 'name', 'score'];
  dataSource11 = new MatTableDataSource<ScoreDetail>();

  @ViewChild('paginator1') paginator1!: MatPaginator;
  @ViewChild('sort1') sort1!: MatSort;
  @ViewChild('paginator11') paginator11!: MatPaginator;
  @ViewChild('sort11') sort11!: MatSort;

  @ViewChild('dialogTemplate1') dialogTemplate1: any;
  @ViewChild('input11') searchInput!: ElementRef<HTMLInputElement>;

  chartOptions!: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    colors: string[];
    xaxis: ApexXAxis;
    plotOptions: ApexPlotOptions;
    legend: ApexLegend;
    yaxis: ApexYAxis;
  };

  constructor(
    private classDetailsService: ClassDetailsService,
    private classroomService: ClassroomService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private router: Router,
    private examScoreService: ExamScoreService
  ) {
    this.chartOptions = {
      series: [
        {
          name: 'Số lượng học sinh',
          data: [],
        },
      ],
      chart: {
        type: 'bar',
        height: 375,
      },
      colors: [
        'rgba(255, 69, 96, 0.85)', 'rgba(255, 69, 96, 0.85)', 'rgba(255, 69, 96, 0.85)', 'rgba(255, 69, 96, 0.85)',
        'rgba(254, 176, 25, 0.85)', 'rgba(254, 176, 25, 0.85)', 'rgba(254, 176, 25, 0.85)', 
        'rgba(0, 143, 251, 0.85)', 'rgba(0, 143, 251, 0.85)', 
        'rgba(0, 227, 150, 0.85)', 'rgba(0, 227, 150, 0.85)'
      ],
      xaxis: {
        categories: [
          '0', '1', '2', '3', '4', '5',
          '6', '7', '8', '9', '10',
        ],
      },
      plotOptions: {
        bar: {
          distributed: true,
          columnWidth: '50%',
        },
      },
      legend: {
        show: false
      },
      yaxis: {
      }
    };
  }

  ngOnInit(): void {
    const userData = sessionStorage.getItem('currentUser');
    const user = JSON.parse(userData!);
    const teacherId = user.id;

    const currentClassId = sessionStorage.getItem('currentClassId');
    if (currentClassId) this.classId = Number(currentClassId);

    this.formGroup = this.fb.group({
      classroomId: [this.classId || null],
    });

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

  ngAfterViewInit(): void {
    this.dataSource1.paginator = this.paginator1;
    this.dataSource1.sort = this.sort1;
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
          this.showDetails = true;
          this.loadClassDetails(classId);
          this.loadClassExam(classId);
        } else {
          this.showToast('error', 'Bạn không có quyền truy cập lớp này');
          sessionStorage.removeItem('currentClassId');
          this.showDetails = false;
          this.router.navigate(['teacher/manage_class']);
        }
      },
      error: () => {
        this.showToast('error', 'Có lỗi xảy ra khi kiểm tra quyền');
        this.showDetails = false;
        this.router.navigate(['teacher/manage_class']);
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

  applyFilter11(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource11.filter = filterValue.trim().toLowerCase();
  }

  resetFilter(): void {
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }
    this.applyFilter11({ target: { value: '' } } as unknown as Event);
  }

  openDialogCreateExam(templateRef: any): void {
    this.dialog.open(templateRef, {
      width: '33%',
      maxHeight: '55vh',    
    });
  }

  submitRequest(examNameCtrl: NgModel): void {
    if (examNameCtrl.invalid) {
      return; 
    }
  
    this.examScoreService.createExam(this.examName, this.classId).subscribe({
      next: () => {
        this.showToast('success', 'Tạo đầu điểm mới thành công')
        this.dialog.closeAll();
        this.loadClassExam(this.classId);
        this.examName = '';  
      },
      error: () => {
        this.showToast('error', 'Lỗi khi tạo đầu điểm mới')
      },
    });
  }  

  downloadScoreTable() {
    this.examScoreService.downloadExamResults(this.classId).subscribe({
      next: (blob: Blob) => {
        const filename = this.getFilenameFromBlob(blob) || 'downloaded_file.xlsx';
        saveAs(blob, filename);
        this.showToast('success', 'Tải bảng điểm thành công');
      },
      error: () => {
        this.showToast('error', 'Lỗi khi tải bảng điểm');
      },
    });
  }  

  private getFilenameFromBlob(blob: Blob): string | null {
    if ((blob as any).name) {
      return (blob as any).name;
    }
  
    return 'downloaded_file.xlsx';
  }

  private loadClassExam(classId: number): void {
    this.examScoreService.getAllExams(classId).subscribe({
      next: (response: any) => {
        const mappedData = response.content.map((item: any) => ({
          id: item.id,
          examName: item.name,
          createdDate: item.createdDate,
        }));
        this.dataSource1.data = mappedData;
      },
      error: () => {
        this.showToast('error', 'Lỗi khi tải danh sách kiểm tra');
      },
    });
  }

  openStudentListDialog(examId: number) {
    this.examId = examId;
    const dialog1 = this.dialog.open(this.dialogTemplate1, {
      width: '95vw',
      maxHeight: '95vh',
    });

    dialog1.afterOpened().subscribe(() => {
      this.dataSource11.paginator = this.paginator11;
      this.dataSource11.sort = this.sort11;
    });

    this.loadStudents(examId);

    const selectedExam = this.dataSource1.data
      .filter((item: any) => item.id === examId)
      .map((item) => ({
        id: item.id,
        examName: item.examName,
        createdDate: item.createdDate
      }));

    this.examDetail = selectedExam[0];

    dialog1.afterClosed().subscribe(() => {
      this.isEditing = false;
      this.resetFilter();
    });
  }

  private loadStudents(examId: number): void {
    this.examScoreService.getStudentsByExamId(examId).subscribe({
      next: (response: any) => {
        const activeData = response.content.map((item: any) => ({
          id: item.id,
          email: item.email,
          name: item.name,
          score: item.score,
        }));

        if (activeData.length === 0) {
          this.activeBtn = false;
        }

        else {
          this.dataSource11.data = activeData;
          this.updateChartData();
        }
      },
      error: () => {
        this.showToast('error', 'Lỗi khi tải dữ liệu')
      },
    });
  }

  updateChartData() {
    const distribution = Array(11).fill(0);

    this.dataSource11.data.forEach((student: any) => {
      const score = student.score;
      
      if (score !== null && score >= 0 && score <= 10) {
        const index = Math.round(score);
        distribution[index]++;
      }
    });

    let maxCount = 0;

    distribution.forEach((count, index) => {
      if (count > maxCount) {
        maxCount = count;
      }
    });
  
    this.chartOptions.series = [
      {
        name: 'Số lượng học sinh',
        data: distribution,
      },
    ];
    this.chartOptions.yaxis = {
      max: maxCount,
      tickAmount: maxCount
    }
  }

  enableEditing() {
    this.isEditing = true;
  }

  saveChanges() {
    this.examScoreService.editExamScores(this.dataSource11.data).subscribe(
      () => {
        this.isEditing = false;
        this.loadStudents(this.examId);
        this.showToast('success', 'Đánh giá điểm thành công');
      },
      () => {
        this.showToast('error', 'Đánh giá điểm thất bại');
        this.cancelEditing();
      }
    );
  }

  cancelEditing() {
    this.isEditing = false;
    this.loadStudents(this.examId);
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
