import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClassDetails, ClassDetailsService, DocumentData, ScheduleData } from '../../../../core/services/class-detail/class-detail.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from '../../../../shared/shared.module';
import { Student } from '../../../../core/services/admin/admin.service';
import { MatSort, MatSortModule } from '@angular/material/sort';
import Swal from 'sweetalert2';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-stu-class-detail',
  standalone: true,
  imports: [MatTabsModule, MatListModule, MatIconModule, MatButtonModule, CommonModule, MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule, MatTableModule,
    MatInputModule, MatToolbarModule, RouterModule, FormsModule, MatPaginatorModule, SharedModule, MatSortModule, ReactiveFormsModule, MatOptionModule,
    MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './stu-class-detail.component.html',
  styleUrl: './stu-class-detail.component.scss'
})
export class StuClassDetailComponent implements OnInit, AfterViewInit {
  classId!: number;
  classDetails!: ClassDetails;
  isEditing = false;

  displayedColumnsStudent: string[] = ['id', 'email', 'lastName', 'surname', 'firstName', 'phone', 'dob'];
  dataSourceStudent = new MatTableDataSource<Student>();
  @ViewChild('paginatorStudent') paginatorStudent!: MatPaginator;
  @ViewChild('sortStudent') sortStudent!: MatSort;

  displayedColumnsSchedule: string[] = ['id', 'day', 'periodInDay', 'dayInWeek', 'createdDate'];
  dataSourceSchedule = new MatTableDataSource<ScheduleData>();
  @ViewChild('paginatorSchedule') paginatorSchedule!: MatPaginator;
  @ViewChild('sortSchedule') sortSchedule!: MatSort;

  displayedColumnsDocument: string[] = ['id', 'documentName', 'createdDate', 'download'];
  dataSourceDocument = new MatTableDataSource<DocumentData>();
  @ViewChild('paginatorDocument') paginatorDocument!: MatPaginator;
  @ViewChild('sortDocument') sortDocument!: MatSort;

  constructor(
    private classDetailsService: ClassDetailsService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.classId = this.route.snapshot.params['id'];

    const userData = sessionStorage.getItem('currentUser');
    const user = JSON.parse(userData!);
    const studentId = user.id;

    this.classDetails = {id: 0, subjectName: '', createdDate: '', note: '', className: '', teacherName: '', teacherEmail: '', teacherPhone: ''};

    this.classDetailsService.checkPermissionForStudent(studentId, this.classId).subscribe({
      next: (hasPermission) => {
        if (hasPermission) {
          sessionStorage.setItem('currentClassId', this.classId.toString());
          this.loadClassDetails();
          this.loadStudents();
          this.loadSchedules();
          this.loadDocuments();
        } else {
          this.showToast('error', 'Bạn không có quyền truy cập lớp này');
          this.router.navigate(['student/class']);
        }
      },
      error: () => {
        this.showToast('error', 'Có lỗi xảy ra khi kiểm tra quyền');
        this.router.navigate(['student/class']);
      },
    });
  }

  ngAfterViewInit(): void {
    this.dataSourceStudent.paginator = this.paginatorStudent;
    this.dataSourceStudent.sort = this.sortStudent;
    this.dataSourceSchedule.paginator = this.paginatorSchedule;
    this.dataSourceSchedule.sort = this.sortSchedule;
    this.dataSourceDocument.paginator = this.paginatorDocument;
    this.dataSourceDocument.sort = this.sortDocument;
  }

  // classDetails
  loadClassDetails(): void {
    this.classDetailsService.getClassDetails(this.classId).subscribe((data) => {
      this.classDetails = data;
    });
  }

  // students
  applyFilterStudent(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceStudent.filter = filterValue.trim().toLowerCase();
  }

  private loadStudents(): void {
    this.classDetailsService.getStudents(this.classId!).subscribe({
      next: (response: any) => {
        const activeData = response.content
          .filter((item: any) => item.student !== null && item.active === true)
          .map((item: any) => ({
            id: item.id,
            email: item.student.email,
            firstName: item.student.firstName,
            surname: item.student.surname,
            lastName: item.student.lastName,
            phone: item.student.phone,
            dob: new Date(item.student.dob).toLocaleDateString('vi-VN'),
          }));
  
        this.dataSourceStudent.data = activeData; 
      },
      error: () => {
        this.showToast('error', 'Lỗi khi tải danh sách học viên');
      },
    });
  }

  // schedules
  applyFilterSchedule(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceSchedule.filter = filterValue.trim().toLowerCase();
  }

  private loadSchedules(): void {
    this.classDetailsService.getSchedules(this.classId!).subscribe({
      next: (response: any) => {
        const mappedData = response.content.map((item: any) => ({
          id: item.id,
          day: item.day,
          periodInDay: this.mapPeriodInDay(item.periodInDay),
          dayInWeek: this.mapDayInWeek(item.dayInWeek),
          createdDate: item.createdDate, 
        }));
        this.dataSourceSchedule.data = mappedData;
      },
      error: () => {
        this.showToast('error', 'Lỗi khi tải danh sách lịch học');
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

  // documents
  applyFilterDocument(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceDocument.filter = filterValue.trim().toLowerCase();
  }

  loadDocuments(): void {
    this.classDetailsService.getDocuments(this.classId).subscribe({
      next: (response: any) => {
        const mappedData = response.content.map((item: DocumentData) => ({
          id: item.id,
          documentName: item.documentName,
          documentLink: item.documentLink,
          createdDate: item.createdDate, 
        }));
        this.dataSourceDocument.data = mappedData;
      },
      error: () => {
        this.showToast('error', 'Lỗi khi tải danh sách tài liệu');
      },
    });
  }
  
  downloadDocument(documentId: number): void {
    this.classDetailsService.downloadDocument(documentId).subscribe({
      next: (blob) => {
        const filename = this.getFilenameFromBlob(blob);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);

        this.showToast('success', 'Tải về tài liệu thành công')
      },
      error: () => {
        this.showToast('error', 'Lỗi không thể tải tài liệu về')
      },
    });
  }

  private getFilenameFromBlob(blob: Blob): string {
    if ((blob as any).name) {
      return (blob as any).name;
    }
    return 'downloaded_file.xlsx';
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
