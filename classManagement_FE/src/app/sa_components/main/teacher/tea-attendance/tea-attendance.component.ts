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
import { ClassScheduleService } from '../../../../core/services/class-schedule/class-schedule.service';
import { ImageService } from '../../../../core/services/image/image.service';

export type ChartOptions = {
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  responsive: ApexResponsive[];
};

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
    ChartComponent,
    MatCheckboxModule,
  ],
  templateUrl: './tea-attendance.component.html',
  styleUrl: './tea-attendance.component.scss',
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
export class TeaAttendanceComponent implements OnInit, AfterViewInit {
  formGroup!: FormGroup;
  registerForm!: FormGroup;

  classrooms: Classroom[] = [];
  showDetails: boolean = false;

  activeBtn = true;
  isEditing = false;
  isEditing2 = false;

  selectedImage: string | null = null;
  file_store: FileList | null = null;

  classId!: number;
  scheduleId!: number;
  classDetails!: ClassDetails;
  scheduleDetails!: ScheduleData;

  displayedColumns1: string[] = [
    'id',
    'day',
    'periodInDay',
    'dayInWeek',
    'createdDate',
    'edit',
  ];
  dataSource1 = new MatTableDataSource<ScheduleData>();

  displayedColumns11: string[] = ['id', 'email', 'name', 'attend'];
  dataSource11 = new MatTableDataSource<Attendance>();

  @ViewChild('paginator1') paginator1!: MatPaginator;
  @ViewChild('sort1') sort1!: MatSort;
  @ViewChild('paginator11') paginator11!: MatPaginator;
  @ViewChild('sort11') sort11!: MatSort;

  @ViewChild('dialogTemplate1') dialogTemplate1: any;
  @ViewChild('input11') searchInput!: ElementRef<HTMLInputElement>;

  chartOptions: Partial<ChartOptions> = {
    chart: {
      width: 333,
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
    private classAttendance: ClassAttendanceService,
    private imageSerive: ImageService
  ) {
    this.registerForm = this.fb.group({
      imageURL: [{ value: '', disabled: true }],
    });
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

    this.formGroup
      .get('classroomId')
      ?.valueChanges.subscribe((selectedClassId) => {
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
          this.loadSchedules(classId);
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

  downloadAttendanceTable() {
    this.classAttendance.downloadAttendanceResults(this.classId).subscribe({
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

  private loadSchedules(classId: number): void {
    this.classDetailsService.getSchedules(classId).subscribe({
      next: (response: any) => {
        const mappedData = response.content.map((item: any) => ({
          id: item.id,
          day: item.day,
          periodInDay: this.mapPeriodInDay(item.periodInDay),
          dayInWeek: this.mapDayInWeek(item.dayInWeek),
          createdDate: item.createdDate,
          imageClassAttendance: item.imageClassAttendance
        }));
        this.dataSource1.data = mappedData;
      },
      error: () => {
        this.showToast('error', 'Tải lịch học không thành công');
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

  private mapDayInWeek(dayInWeek: string): string {
    const dayMap: { [key: string]: string } = {
      MONDAY: 'Thứ Hai',
      TUESDAY: 'Thứ Ba',
      WEDNESDAY: 'Thứ Tư',
      THURSDAY: 'Thứ Năm',
      FRIDAY: 'Thứ Sáu',
      SATURDAY: 'Thứ Bảy',
      SUNDAY: 'Chủ Nhật',
    };
    return dayMap[dayInWeek] || dayInWeek;
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

  openStudentListDialog(scheduleId: number) {
    this.scheduleId = scheduleId;

    const dialog1 = this.dialog.open(this.dialogTemplate1, {
      width: '85%',
      maxHeight: '95vh',
    });

    dialog1.afterOpened().subscribe(() => {
      this.dataSource11.paginator = this.paginator11;
      this.dataSource11.sort = this.sort11;
    });

    this.loadStudents(scheduleId);

    const selectedSchedule = this.dataSource1.data
      .filter((item: any) => item.id === scheduleId)
      .map((item) => ({
        id: item.id,
        day: new Date(item.day).toLocaleDateString('vi-VN'),
        periodInDay: item.periodInDay,
        dayInWeek: item.dayInWeek,
        createdDate: item.createdDate,
        imageClassAttendance: item.imageClassAttendance
      })
    );

    this.scheduleDetails = selectedSchedule[0];

    console.log(this.scheduleDetails)

    dialog1.afterClosed().subscribe(() => {
      this.isEditing = false;
      this.resetFilter();
      this.registerForm.reset();
      this.selectedImage = null;
    });
  }

  private loadStudents(scheduleId: number): void {
    this.classAttendance.getClassAttendance(scheduleId).subscribe({
      next: (response: any) => {
        const activeData = response.content.map((item: any) => ({
          id: item.id,
          email: item.email,
          name: item.name,
          isAttended: item.isAttended,
        }));

        if (activeData.length === 0) {
          this.activeBtn = false;
        }

        else {
          this.dataSource11.data = activeData;
          this.totalCount = response.content.length;
          this.updateChartData();
        }

        if (this.scheduleDetails.imageClassAttendance !== null) {
          this.registerForm.patchValue({ imageURL: this.scheduleDetails.imageClassAttendance });
          this.loadImage(this.scheduleDetails.imageClassAttendance);
        }
      },
      error: () => {
        this.showToast('error', 'Lỗi khi tải dữ liệu');
      },
    });
  }

  updateChartData() {
    const attendedCount = this.dataSource11.data.filter(
      (row) => row.isAttended
    ).length;
    const absentCount = this.totalCount - attendedCount;
    this.chartSeries = [attendedCount, absentCount];
  }

  enableEditing() {
    this.isEditing = true;
  }

  enableEditing2() {
    this.isEditing2 = true;
    this.registerForm.enable();
  }

  markAllAttended() {
    this.dataSource11.data.forEach((row) => (row.isAttended = true));
    this.updateChartData();
  }

  saveChanges() {
    this.classAttendance.updateAttendance(this.dataSource11.data).subscribe(
      () => {
        this.isEditing = false;
        this.showToast('success', 'Điểm danh thành công');
      },
      () => {
        this.showToast('error', 'Điểm danh thất bại');
        this.cancelEditing();
      }
    );
  }

  cancelEditing() {
    this.isEditing = false;
    this.loadStudents(this.scheduleId);
    this.updateChartData();
  }

  cancelEditing2() {
    this.isEditing2 = false;
    this.registerForm.disable();
    this.loadStudents(this.scheduleId);
    this.updateChartData();
  }

  saveImageClassAttendance() {
    if (this.registerForm.valid && this.file_store && this.file_store[0]) this.uploadImage();
  }

  loadImage(imagePath: string | null): void {
    if (imagePath) {
      this.imageSerive.getImageAttendance(this.scheduleId).subscribe(
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

  uploadImage(): void {
    if (this.file_store && this.file_store[0]) {
      const formData: FormData = new FormData();
      formData.append('file', this.file_store[0]);

      this.classAttendance.uploadImageForAttend(formData, this.scheduleId).subscribe(
        (response: boolean) => {
          this.loadSchedules(this.classId);
          this.loadStudents(this.scheduleId);
          this.isEditing2 = false;
          this.registerForm.disable();
          
          if (!response) {
            this.showToast('error', 'Không thể tải hình ảnh')
          }
          else {
            this.showToast('success', 'Tải ảnh thành công');
          }
        },
        () => {
          this.isEditing2 = false;
          this.registerForm.disable();
          this.showToast('error', 'Có lỗi xảy ra khi tải ảnh')
        }
      );
    }
  }

  handleFileInputChange(files: FileList | null): void {
    this.file_store = files;
    if (files && files[0]) {
      const file = files[0];
      const count = files.length > 1 ? `(+${files.length - 1} files)` : '';
      this.registerForm.patchValue({
        imageURL: `${file.name}${count}`,
      });
    } else {
      this.registerForm.patchValue({
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
