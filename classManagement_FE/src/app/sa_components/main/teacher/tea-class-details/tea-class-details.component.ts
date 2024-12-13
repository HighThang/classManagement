import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClassDetails, ClassDetailsService, ScheduleData } from '../../../../core/services/class-detail/class-detail.service';
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
import { FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from '../../../../shared/shared.module';
import { Student } from '../../../../core/services/admin/admin.service';
import { MatSort, MatSortModule } from '@angular/material/sort';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { UserResponse } from '../../../../core/interfaces/response.interface';
import saveAs from 'file-saver';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-tea-class-details',
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
    MatCardModule
  ],
  templateUrl: './tea-class-details.component.html',
  styleUrls: ['./tea-class-details.component.scss'],
})
export class TeaClassDetailsComponent implements OnInit, AfterViewInit {
  classId!: number;
  classDetails!: ClassDetails;
  editedClassName: string = '';
  editedNote: string = '';
  isEditing: boolean = false;
  formGroup: FormGroup;

  displayedColumns1: string[] = ['id', 'email', 'lastName', 'surname', 'firstName', 'phone', 'dob', 'deleted'];
  dataSource1 = new MatTableDataSource<Student>();
  displayedColumns11: string[] = ['id', 'email', 'lastName', 'surname', 'firstName', 'phone', 'dob', 'active', 'deleted'];
  dataSource11 = new MatTableDataSource<Student>();

  displayedColumns2: string[] = ['id', 'day', 'periodInDay', 'dayInWeek', 'createdDate', 'deleted'];
  dataSource2 = new MatTableDataSource<ScheduleData>();

  displayedColumns3: string[] = ['documentName', 'documentLink', 'actions'];

  @ViewChild('paginator1') paginator1!: MatPaginator;
  @ViewChild('sort1') sort1!: MatSort;
  @ViewChild('paginator11') paginator11!: MatPaginator;
  @ViewChild('sort11') sort11!: MatSort;
  @ViewChild('paginator2') paginator2!: MatPaginator;
  @ViewChild('sort2') sort2!: MatSort;
  @ViewChild('dialogTemplate1') dialogTemplate1: any;
  @ViewChild('dialogTemplate2') dialogTemplate2: any;

  @ViewChild('input11') searchInput!: ElementRef<HTMLInputElement>;
  
  documents: any[] = [];
  selectedFile: File | null = null;

  constructor(
    private classDetailsService: ClassDetailsService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.formGroup = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      periodInDay: [null, Validators.required],
      dayInWeek: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.classId = this.route.snapshot.params['id'];

    const userData = sessionStorage.getItem('currentUser');
    const user = JSON.parse(userData!);
    const teacherId = user.id;

    this.classDetails = {
      id: 0,
      subjectName: '',
      createdDate: '',
      note: '',
      className: '',
      teacherName: ''
    };

    this.classDetailsService.checkPermission(teacherId, this.classId).subscribe({
      next: (hasPermission) => {
        if (hasPermission) {
          sessionStorage.setItem('currentClassId', this.classId.toString());

          this.loadClassDetails();
          this.loadStudents();
          this.loadSchedules();
          this.loadDocuments();
        } else {
          this.showToast('error', 'Bạn không có quyền truy cập lớp này');
          this.router.navigate(['teacher/manage_class']);
        }
      },
      error: () => {
        this.showToast('error', 'Có lỗi xảy ra khi kiểm tra quyền');
        this.router.navigate(['teacher/manage_class']);
      },
    });
  }

  ngAfterViewInit(): void {
    this.dataSource1.paginator = this.paginator1;
    this.dataSource1.sort = this.sort1;
    this.dataSource2.paginator = this.paginator2;
    this.dataSource2.sort = this.sort2;
  }

  // classDetails
  loadClassDetails(): void {
    this.classDetailsService.getClassDetails(this.classId).subscribe((data) => {
      this.classDetails = data;
      this.editedClassName = data.className;
      this.editedNote = data.note;
    });
  }

  enableEdit(): void {
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.loadClassDetails();
  }

  saveChanges(classNameCtrl: NgModel): void {
    if (classNameCtrl.invalid) {
      return;
    }

    const updatedClassDetails: ClassDetails = {
      ...this.classDetails,
      className: this.editedClassName,
      note: this.editedNote,
    };

    this.classDetailsService.updateClassDetails(updatedClassDetails).subscribe({
      next: () => {
        this.isEditing = false;
        this.showToast('success', 'Chỉnh sửa thành công!');
        this.loadClassDetails();
      },
      error: () => {
        this.showToast('error', 'Đã có lỗi xảy ra khi lưu!');
      },
    });
  }

  // Students
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
  
        const inactiveData = response.content
          .filter((item: any) => item.student === null || item.active === false)
          .map((item: any) => ({
            id: item.id,
            email: item.email,
            firstName: item.firstName,
            surname: item.surname,
            lastName: item.lastName,
            phone: item.phone,
            dob: new Date(item.dob).toLocaleDateString('vi-VN'),
          }));
  
        this.dataSource1.data = activeData; 
        this.dataSource11.data = inactiveData;
      },
      error: (err) => {
        this.showToast('error', 'Lỗi khi tải danh sách học sinh');
      },
    });
  }

  openWaitingListDialog() {
    const dialog2 = this.dialog.open(this.dialogTemplate1, {
      width: '77%',  maxHeight: '77vh'
    });

    dialog2.afterOpened().subscribe(() => {
      this.dataSource11.paginator = this.paginator11;
      this.dataSource11.sort = this.sort11;
    });

    dialog2.afterClosed().subscribe(() => {
      this.resetFilter();
    });
  }

  activateStudent(studentId: number) {
    this.classDetailsService.activateStudent(studentId).subscribe({
      next: () => {
        this.showToast('success', 'Kích hoạt học sinh thành công');
        this.loadStudents();
      },
      error: () => {
        this.showToast('error', 'Lỗi khi kích hoạt học sinh này');
      },
    });
  }

  deleteStudent(studentId: number): void {
    Swal.fire({
      title: 'Xác nhận',
      text: 'Bạn có chắc chắn muốn xóa học sinh này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        this.classDetailsService.deleteStudent(studentId).subscribe({
          next: () => {
            this.showToast('success', 'Xóa học sinh thành công')
            this.loadStudents();
          },
          error: () => {
            this.showToast('error', 'Không thể xóa học sinh này')
          },
        });
      }
    });
  }  

  downloadStudentList() {
    this.classDetailsService.downloadStudentResults(this.classId).subscribe({
      next: (blob: Blob) => {
        const filename = this.getFilenameFromBlob(blob);
        saveAs(blob, filename);
        this.showToast('success', 'Tải bảng điểm thành công');
      },
      error: () => {
        this.showToast('error', 'Lỗi khi tải bảng điểm');
      },
    });
  }  

  private getFilenameFromBlob(blob: Blob): string {
    if ((blob as any).name) {
      return (blob as any).name;
    }
  
    return 'downloaded_file.xlsx';
  }
  
  // Schedules
  periods = [
    { value: 'PERIOD_1', viewValue: 'Ca học 1' },
    { value: 'PERIOD_2', viewValue: 'Ca học 2' },
    { value: 'PERIOD_3', viewValue: 'Ca học 3' },
    { value: 'PERIOD_4', viewValue: 'Ca học 4' },
    { value: 'PERIOD_5', viewValue: 'Ca học 5' },
    { value: 'PERIOD_6', viewValue: 'Ca học 6' },
  ];

  daysInWeek = [
    { value: 'MONDAY', viewValue: 'Thứ Hai' },
    { value: 'TUESDAY', viewValue: 'Thứ Ba' },
    { value: 'WEDNESDAY', viewValue: 'Thứ Tư' },
    { value: 'THURSDAY', viewValue: 'Thứ Năm' },
    { value: 'FRIDAY', viewValue: 'Thứ Sáu' },
    { value: 'SATURDAY', viewValue: 'Thứ Bảy' },
    { value: 'SUNDAY', viewValue: 'Chủ Nhật' },
  ];

  applyFilter2(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
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
        this.dataSource2.data = mappedData;
      },
      error: () => {
        this.showToast('error', 'Lỗi khi tải danh sách lịch học');
      },
    });
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

  openAddScheduleDialog() {
    const dialogRef = this.dialog.open(this.dialogTemplate2, {
      width: '77%',  maxHeight: '77vh'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.formGroup.reset();
    });
  }

  saveSchedule() {
    if (this.formGroup.invalid) return;
  
    const payload = {
      startDate: this.formGroup.value.startDate,
      endDate: this.formGroup.value.endDate,
      periodInDay: this.formGroup.value.periodInDay,
      dayInWeek: this.formGroup.value.dayInWeek,
      classId: this.classId,
    };
  
    this.http.post('http://localhost:8081/api/class-schedule', payload).subscribe({
      next: () => {
        this.showToast('success', 'Tạo lịch học thành công');
        this.dialog.closeAll();
        this.loadSchedules(); 
      },
      error: () => {
        this.showToast('error', 'Có lỗi xảy ra khi tạo lịch học');
      },
    });
  }
  
  deleteSchedule(scheduleId: number) {
    Swal.fire({
      title: 'Xác nhận',
      text: 'Bạn có chắc chắn muốn xóa lịch học này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        this.classDetailsService.deleteSchdule(scheduleId).subscribe({
          next: () => {
            this.showToast('success', 'Xóa lịch học thành công');
            this.loadSchedules();
          },
          error: () => {
            this.showToast('error', 'Có lỗi xảy ra khi xóa lịch học');
          },
        });
      }
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

  // Documents
  loadDocuments(): void {
    this.classDetailsService.getDocuments(this.classId).subscribe({
      next: (data: any) => {
        this.documents = data.content;
      },
      error: (err) => {
        console.error('Error fetching documents:', err);
      },
    });
  }

  // openUploadDocumentDialog() {
  //   // Open dialog to upload document
  // }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
    } else {
      alert('Vui lòng chọn tệp PDF.');
    }
  }

  uploadDocument(): void {
    if (this.selectedFile) {
      this.classDetailsService.uploadDocumentPdf(this.classId, this.selectedFile).subscribe({
        next: () => {
          alert('Tải lên thành công!');
          this.loadDocuments();
          this.selectedFile = null;
        },
        error: (err) => {
          console.error('Error uploading document:', err);
        },
      });
    } else {
      alert('Vui lòng chọn một file để tải lên.');
    }
  }

  deleteDocument(documentId: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa tài liệu này không?')) {
      this.classDetailsService.deleteDocument(documentId).subscribe({
        next: () => {
          alert('Xóa thành công!');
          this.loadDocuments();
        },
        error: (err) => {
          console.error('Error deleting document:', err);
          alert('Không thể xóa tài liệu. Vui lòng thử lại sau.');
        },
      });
    }
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
      },
      error: () => {
        this.showToast('error', 'Lỗi không thể tải tài liệu')
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