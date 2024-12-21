import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ClassDetails, ClassDetailsService, ScheduleData } from '../../../../core/services/class-detail/class-detail.service';
import Swal from 'sweetalert2';
import { Classroom, ClassroomService } from '../../../../core/services/classroom/classroom.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { ChartComponent, ApexChart, ApexLegend, ApexDataLabels, ApexResponsive } from 'ng-apexcharts';
import { Attendance, ClassAttendanceService } from '../../../../core/services/class-attendance/class-attendance.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import saveAs from 'file-saver';
import { ImageService } from '../../../../core/services/image/image.service';
import { FaceRecognitionService } from '../../../../core/services/face-recognition/face-recognition.service';

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
  imports: [MatTabsModule, MatListModule, MatIconModule, MatButtonModule, CommonModule, MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule,
    MatTableModule, MatInputModule, MatToolbarModule, RouterModule, FormsModule, MatPaginatorModule, SharedModule, MatSortModule, ReactiveFormsModule,
    MatOptionModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatSelectModule, ChartComponent, MatCheckboxModule],
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
  attendanceImageForm!: FormGroup;
  classrooms: Classroom[] = [];
  showDetails: boolean = false;
  activeBtn = true;
  isEditing = false;
  isEditing2 = false;
  isLoading: boolean = false;
  selectedImage: string | null = null;
  file_store: FileList | null = null;
  classId!: number;
  scheduleId!: number;
  classDetails!: ClassDetails;
  scheduleDetails!: ScheduleData;
  attendedResponses!: any;
  withoutEncodingNames: string = '';

  displayedColumnsSchedule: string[] = ['id', 'day', 'periodInDay', 'dayInWeek', 'createdDate', 'edit'];
  dataSourceSchedule = new MatTableDataSource<ScheduleData>();

  displayedColumnsAttendance: string[] = ['id', 'email', 'name', 'attend'];
  dataSourceAttendance = new MatTableDataSource<Attendance>();

  @ViewChild('paginatorSchedule') paginatorSchedule!: MatPaginator;
  @ViewChild('sortSchedule') sortSchedule!: MatSort;
  @ViewChild('paginatorAttendance') paginatorAttendance!: MatPaginator;
  @ViewChild('sortAttendance') sortAttendance!: MatSort;

  @ViewChild('dialogTemplateAttendance') dialogTemplateAttendance: any;
  @ViewChild('inputAttendance') searchInput!: ElementRef<HTMLInputElement>;

  @ViewChild('attendedByImage') attendedByImage: any;

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
    private imageSerive: ImageService,
    private faceRecognitionService: FaceRecognitionService
  ) {
    this.attendanceImageForm = this.fb.group({
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
    else this.activeBtn = false;

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
    this.dataSourceSchedule.paginator = this.paginatorSchedule;
    this.dataSourceSchedule.sort = this.sortSchedule;
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
          this.activeBtn = true;
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

  applyFilterSchedule(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceSchedule.filter = filterValue.trim().toLowerCase();
  }

  applyFilterAttendance(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceAttendance.filter = filterValue.trim().toLowerCase();
  }

  resetFilter(): void {
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }
    this.applyFilterAttendance({ target: { value: '' } } as unknown as Event);
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
        this.dataSourceSchedule.data = mappedData;
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

    const dialog1 = this.dialog.open(this.dialogTemplateAttendance, {
      width: '85%',
      maxHeight: '95vh',
    });

    dialog1.afterOpened().subscribe(() => {
      this.dataSourceAttendance.paginator = this.paginatorAttendance;
      this.dataSourceAttendance.sort = this.sortAttendance;
    });

    const selectedSchedule = this.dataSourceSchedule.data
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

    this.loadStudents(scheduleId);

    dialog1.afterClosed().subscribe(() => {
      this.isEditing = false;
      this.isEditing2 = false;
      this.resetFilter();
      this.attendanceImageForm.reset();
      this.attendanceImageForm.disable();
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

        const selectedSchedule = this.dataSourceSchedule.data
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

        if (activeData.length === 0) {
          this.activeBtn = false;
        }

        else {
          this.activeBtn = true;
          this.dataSourceAttendance.data = activeData;
          this.totalCount = response.content.length;
          this.updateChartData();
        }

        if (this.scheduleDetails.imageClassAttendance !== null) {
          this.attendanceImageForm.patchValue({ imageURL: this.scheduleDetails.imageClassAttendance });
          this.loadImage(this.scheduleDetails.imageClassAttendance);
        }
      },
      error: () => {
        this.showToast('error', 'Lỗi khi tải dữ liệu');
      },
    });
  }

  updateChartData() {
    const attendedCount = this.dataSourceAttendance.data.filter(
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
    this.attendanceImageForm.enable();
  }

  markAllAttended() {
    this.dataSourceAttendance.data.forEach((row) => (row.isAttended = true));
    this.updateChartData();
  }

  saveChanges() {
    this.classAttendance.updateAttendance(this.dataSourceAttendance.data).subscribe(
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
    this.attendanceImageForm.disable();
    this.attendanceImageForm.reset();
    this.loadStudents(this.scheduleId);
    this.updateChartData();
    this.selectedImage = null;
    this.file_store = null;
  }

  saveImageClassAttendance() {
    if (this.attendanceImageForm.valid && this.file_store && this.file_store[0]) this.uploadImage();
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
      this.isLoading = true;

      const formData: FormData = new FormData();
      formData.append('file', this.file_store[0]);

      this.classAttendance.uploadImageForAttend(formData, this.scheduleId).subscribe(
        (response: boolean) => {          
          if (!response) {
            this.reset();
            this.isLoading = false;
            this.showToast('error', 'Không thể tải hình ảnh')
          }
          else {
            this.faceRecognitionService.recognizeFaces(this.scheduleId).subscribe({
              next: (res) => {
                this.reset();
                this.isLoading = false;

                const dialog = this.dialog.open(this.attendedByImage, {
                  width: '44%',
                  maxHeight: '44vh',
                });

                this.attendedResponses = res;
          
                this.withoutEncodingNames = this.attendedResponses.students_without_encoding.length > 0
                  ? this.attendedResponses.students_without_encoding.map((student: any) => student.student_name).join(', ')
                  : '';
          
                this.showToast('success', 'Điểm danh bằng ảnh thành công');

                dialog.afterClosed().subscribe(() => {
                  this.attendedResponses = '';
                  this.withoutEncodingNames = '';
                });
              },
              error: (err) => {
                this.reset();
                this.isLoading = false;

                this.showToast('error', err.error.error);
              },
            });
          }
        },
        () => {
          this.isEditing2 = false;
          this.attendanceImageForm.disable();
          this.showToast('error', 'Có lỗi xảy ra khi tải ảnh')
        }
      );
    }
  }

  reset() {
    this.loadSchedules(this.classId);
    this.loadStudents(this.scheduleId);
    this.isEditing2 = false;
    this.attendanceImageForm.disable();
    this.selectedImage = null;
    this.file_store = null;
  }

  handleFileInputChange(files: FileList | null): void {
    this.file_store = files;
    if (files && files[0]) {
      const file = files[0];
      const count = files.length > 1 ? `(+${files.length - 1} files)` : '';
      this.attendanceImageForm.patchValue({
        imageURL: `${file.name}${count}`,
      });
    } else {
      this.attendanceImageForm.patchValue({
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
