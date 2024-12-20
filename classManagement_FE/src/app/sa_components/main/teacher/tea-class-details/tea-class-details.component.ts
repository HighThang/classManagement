import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { AbstractControl, FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from '../../../../shared/shared.module';
import { Student } from '../../../../core/services/admin/admin.service';
import { MatSort, MatSortModule } from '@angular/material/sort';
import Swal from 'sweetalert2';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import saveAs from 'file-saver';

export function dateRangeValidator(startDateKey: string, endDateKey: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const startDate = control.get(startDateKey)?.value;
    const endDate = control.get(endDateKey)?.value;

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return { dateRangeInvalid: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-tea-class-details',
  standalone: true,
  imports: [MatTabsModule, MatListModule, MatIconModule, MatButtonModule, CommonModule, MatProgressSpinnerModule, MatDialogModule, MatSnackBarModule,
    MatTableModule, MatInputModule, MatToolbarModule, RouterModule, FormsModule, MatPaginatorModule, SharedModule, MatSortModule, ReactiveFormsModule,
    MatOptionModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './tea-class-details.component.html',
  styleUrls: ['./tea-class-details.component.scss'],
})
export class TeaClassDetailsComponent implements OnInit, AfterViewInit {
  classId!: number;
  classDetails!: ClassDetails;
  editedClassName: string = '';
  editedNote: string = '';
  isLoading: boolean = false;
  isEditing: boolean = false;
  formGroup: FormGroup;
  daysInWeek: { value: string, viewValue: string }[] = [];
  selectedFile: File | null = null;

  displayedColumnsStudent: string[] = ['id', 'email', 'lastName', 'surname', 'firstName', 'phone', 'dob', 'deleted'];
  dataSourceStudent = new MatTableDataSource<Student>();
  @ViewChild('paginatorStudent') paginatorStudent!: MatPaginator;
  @ViewChild('sortStudent') sortStudent!: MatSort;

  @ViewChild('dialogTemplatePendingStudent') dialogTemplatePendingStudent: any;
  displayedColumnsPendingStudent: string[] = ['id', 'email', 'lastName', 'surname', 'firstName', 'phone', 'dob', 'active', 'deleted'];
  dataSourcePendingStudent = new MatTableDataSource<Student>();
  @ViewChild('inputPendingStudent') searchInputPendingStudent!: ElementRef<HTMLInputElement>;
  @ViewChild('paginatorPendingStudent') paginatorPendingStudent!: MatPaginator;
  @ViewChild('sortPendingStudent') sortPendingStudent!: MatSort;
  
  @ViewChild('dialogTemplateDisabledStudent') dialogTemplateDisabledStudent: any;
  displayedColumnsDisabledStudent: string[] = ['id', 'email', 'lastName', 'surname', 'firstName', 'phone', 'dob', 'active'];
  dataSourceDisabledStudent = new MatTableDataSource<Student>();
  @ViewChild('inputDisabledStudent') searchInputDisabledStudent!: ElementRef<HTMLInputElement>;
  @ViewChild('paginatorDisabledStudent') paginatorDisabledStudent!: MatPaginator;
  @ViewChild('sortDisabledStudent') sortDisabledStudent!: MatSort;

  displayedColumnsSchedule: string[] = ['id', 'day', 'periodInDay', 'dayInWeek', 'createdDate', 'deleted'];
  dataSourceSchedule = new MatTableDataSource<ScheduleData>();
  @ViewChild('paginatorSchedule') paginatorSchedule!: MatPaginator;
  @ViewChild('sortSchedule') sortSchedule!: MatSort;
  @ViewChild('dialogTemplateSchedule') dialogTemplateSchedule: any;

  displayedColumnsDocument: string[] = ['id', 'documentName', 'createdDate', 'download', 'delete'];
  dataSourceDocument = new MatTableDataSource<DocumentData>();
  @ViewChild('paginatorDocument') paginatorDocument!: MatPaginator;
  @ViewChild('sortDocument') sortDocument!: MatSort;
  @ViewChild('dialogTemplateDocument') dialogTemplateDocument: any;
  @ViewChild('inputDoc') inputDoc!: ElementRef<HTMLInputElement>;

  constructor(
    private classDetailsService: ClassDetailsService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.formGroup = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      periodInDay: [null, Validators.required],
      dayInWeek: [null, Validators.required],
    }, { validators: dateRangeValidator('startDate', 'endDate') });
  }

  ngOnInit(): void {
    this.classId = this.route.snapshot.params['id'];

    const userData = sessionStorage.getItem('currentUser');
    const user = JSON.parse(userData!);
    const teacherId = user.id;

    this.classDetails = { id: 0, subjectName: '', createdDate: '', note: '', className: '', teacherName: '', teacherEmail: '', teacherPhone: '' };
    
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
      error: (err) => {
        this.showToast('error', err.error.error || 'Lỗi khi sửa thông tin lớp học');
      },
    });
  }

  // Students
  applyFilterStudent(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceStudent.filter = filterValue.trim().toLowerCase();
  }

  applyFilterPendingStudent(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourcePendingStudent.filter = filterValue.trim().toLowerCase();
  }

  applyFilterDisabledStudent(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceDisabledStudent.filter = filterValue.trim().toLowerCase();
  }

  resetFilter(): void {
    if (this.searchInputPendingStudent) {
      this.searchInputPendingStudent.nativeElement.value = '';
    }
    this.applyFilterPendingStudent({ target: { value: '' } } as unknown as Event);
  }

  resetFilter2(): void {
    if (this.searchInputDisabledStudent) {
      this.searchInputDisabledStudent.nativeElement.value = '';
    }
    this.applyFilterDisabledStudent({ target: { value: '' } } as unknown as Event);
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
          .filter((item: any) => item.active === false && item.deleted === false)
          .map((item: any) => ({
            id: item.id,
            email: item.email,
            firstName: item.firstName,
            surname: item.surname,
            lastName: item.lastName,
            phone: item.phone,
            dob: new Date(item.dob).toLocaleDateString('vi-VN'),
          }));

        const deletedData = response.content
          .filter((item: any) => item.deleted === true)
          .map((item: any) => ({
            id: item.id,
            email: item.email,
            firstName: item.firstName,
            surname: item.surname,
            lastName: item.lastName,
            phone: item.phone,
            dob: new Date(item.dob).toLocaleDateString('vi-VN'),
          }));
  
        this.dataSourceStudent.data = activeData; 
        this.dataSourcePendingStudent.data = inactiveData;
        this.dataSourceDisabledStudent.data = deletedData;
      },
      error: () => {
        this.showToast('error', 'Lỗi khi tải danh sách học sinh');
      },
    });
  }

  openWaitingListDialog() {
    const dialog2 = this.dialog.open(this.dialogTemplatePendingStudent, {
      width: '77%',  maxHeight: '77vh'
    });

    dialog2.afterOpened().subscribe(() => {
      this.dataSourcePendingStudent.paginator = this.paginatorPendingStudent;
      this.dataSourcePendingStudent.sort = this.sortPendingStudent;
    });

    dialog2.afterClosed().subscribe(() => {
      this.resetFilter();
    });
  }

  openDeletedStudentDialog() {
    const dialog3 = this.dialog.open(this.dialogTemplateDisabledStudent, {
      width: '77%',  maxHeight: '77vh'
    });

    dialog3.afterOpened().subscribe(() => {
      this.dataSourceDisabledStudent.paginator = this.paginatorDisabledStudent;
      this.dataSourceDisabledStudent.sort = this.sortDisabledStudent;
    });

    dialog3.afterClosed().subscribe(() => {
      this.resetFilter2();
    });
  }

  activateStudent(studentId: number) {
    this.isLoading = true;

    this.classDetailsService.activateStudent(studentId).subscribe({
      next: () => {
        this.isLoading = false;
        this.showToast('success', 'Kích hoạt học sinh thành công');
        this.loadStudents();
      },
      error: () => {
        this.isLoading = false;
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
      cancelButtonColor: '#6c757d',
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
            this.showToast('error', 'Có lỗi xảy ra khi xóa học sinh')
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
    const dialogRef = this.dialog.open(this.dialogTemplateSchedule, {
      width: '66%',  maxHeight: '77vh'
    });

    this.formGroup.get('startDate')?.valueChanges.subscribe(() => {
      this.updateDaysInWeek();
    });

    this.formGroup.get('endDate')?.valueChanges.subscribe(() => {
      this.updateDaysInWeek();
    });

    dialogRef.afterClosed().subscribe(() => {
      this.formGroup.reset();
    });
  }

  updateDaysInWeek(): void {
    const startDate = new Date(this.formGroup.get('startDate')?.value);
    const endDate = new Date(this.formGroup.get('endDate')?.value);
  
    if (startDate && endDate && endDate >= startDate) {
      this.daysInWeek = this.calculateDaysInWeek(startDate, endDate);
    } else {
      this.daysInWeek = [];
    }
  }

  calculateDaysInWeek(startDate: Date, endDate: Date): { value: string, viewValue: string }[] {
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const daysInVietnamese = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
    const daysInWeek: Set<{ value: string, viewValue: string }> = new Set();
  
    for (let i = 0; i < days.length; i++) {
      daysInWeek.add({ value: days[i], viewValue: daysInVietnamese[i] });
    }
  
    const existingDaysInWeek: Set<string> = new Set();
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      existingDaysInWeek.add(days[(d.getDay() + 6) % 7]);
    }
  
    return Array.from(daysInWeek).filter(day => existingDaysInWeek.has(day.value));
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
  
    this.classDetailsService.createSchedule(payload).subscribe({
      next: () => {
        this.showToast('success', 'Tạo lịch học thành công');
        this.dialog.closeAll();
        this.loadSchedules();
      },
      error: (err) => {
        if (err.error.error) {
          Swal.fire('Lỗi !!', err.error.error, 'error');
        } else {
          this.showToast('error', 'Có lỗi xảy ra khi tạo lịch học');
        }
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
      cancelButtonColor: '#6c757d',
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

  applyFilterDocument(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceDocument.filter = filterValue.trim().toLowerCase();
  }

  openUploadDocumentDialog() {
    const dialogRef = this.dialog.open(this.dialogTemplateDocument, {
      width: '40%',  maxHeight: '55vh'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.resetUploadDoc();
    });
  }

  resetUploadDoc(): void {
    if (this.inputDoc) {
      this.inputDoc.nativeElement.value = '';
      this.selectedFile = null;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null; 
    }
  }

  uploadDocument(): void {
    if (this.selectedFile) {
      this.classDetailsService.uploadDocumentPdf(this.classId, this.selectedFile).subscribe({
        next: () => {
          this.showToast('success', 'Tải lên tài liệu thành công');
          this.loadDocuments();
          this.selectedFile = null;
          this.dialog.closeAll();
        },
        error: () => {
          this.showToast('error', 'Lỗi không thể tải tài liệu lên');
        },
      });
    }
  }

  deleteDocument(documentId: number): void {
    Swal.fire({
      title: 'Xác nhận',
      text: 'Bạn có chắc chắn muốn xóa tài liệu này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        this.classDetailsService.deleteDocument(documentId).subscribe({
          next: () => {
            this.showToast('success', 'Xóa tài liệu thành công')
            this.loadDocuments();
          },
          error: () => {
            this.showToast('error', 'Lỗi không thể xóa tài liệu')
          },
        });
      }
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
