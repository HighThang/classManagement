import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { ClassDetails, ClassDetailsService } from '../../../../core/services/class-detail/class-detail.service';
import Swal from 'sweetalert2';
import { Classroom, ClassroomService } from '../../../../core/services/classroom/classroom.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FeeService, TutorFeeDetailDto, TutorFeeDto } from '../../../../core/services/fee/fee.service';

@Component({
  selector: 'app-tea-fee',
  standalone: true,
  imports: [MatTabsModule, MatListModule, MatIconModule, MatButtonModule, CommonModule, MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule,
    MatTableModule, MatInputModule, MatToolbarModule, RouterModule, FormsModule, MatPaginatorModule, SharedModule, MatSortModule, ReactiveFormsModule,
    MatOptionModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatSelectModule, MatCheckboxModule],
  templateUrl: './tea-fee.component.html',
  styleUrl: './tea-fee.component.scss',
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
export class TeaFeeComponent implements OnInit, AfterViewInit {
  formGroup!: FormGroup;
  formGroup2!: FormGroup;
  formGroup3!: FormGroup;

  classrooms: Classroom[] = [];
  showDetails: boolean = false;
  activeBtn: boolean = true;
  isEditing: boolean = false;
  isLoading = false;
  classId!: number;
  classDetails!: ClassDetails;
  tutorFeeId!: number;
  selectedTutorFee!: TutorFeeDto;

  displayedColumnsFee: string[] = ['id', 'year', 'month', "totalLesson", "lessonPrice", "feeEstimate", "feeCollected", "feeNotCollected", "createdDate", "details"];
  dataSourceFee = new MatTableDataSource<TutorFeeDto>();

  @ViewChild('paginatorFee') paginatorFee!: MatPaginator;
  @ViewChild('sortFee') sortFee!: MatSort;

  @ViewChild('dialogTemplateFeeDetails') dialogTemplateFeeDetails: any;

  displayedColumnsFeeDetails: string[] = ['id', "studentName", "email", "phone", "totalNumberOfClasses", "numberOfClassesAttended", "feeAmount", "feeSubmitted", "feeNotSubmitted"];
  dataSourceFeeDetails = new MatTableDataSource<TutorFeeDetailDto>();

  @ViewChild('paginatorFeeDetails') paginatorFeeDetails!: MatPaginator;
  @ViewChild('sortFeeDetails') sortFeeDetails!: MatSort;
  @ViewChild('inputFeeDetails') searchInput!: ElementRef<HTMLInputElement>;
  
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
    const teacherId = user.id;

    const currentClassId = sessionStorage.getItem('currentClassId');
    if (currentClassId) this.classId = Number(currentClassId);

    this.formGroup = this.fb.group({
      classroomId: [this.classId || null],
    });

    this.formGroup2 = this.fb.group({
      classId: this.classId,
      month: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(2200)]],
      classSessionPrice: [null, [Validators.required, Validators.min(0)]],
    })

    this.classDetails = { id: 0, subjectName: '', createdDate: '', note: '', className: '', teacherName: '', teacherEmail: '', teacherPhone: '' };

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
    this.dataSourceFee.paginator = this.paginatorFee;
    this.dataSourceFee.sort = this.sortFee;
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
          this.loadTutorFee(classId);

          this.formGroup2 = this.fb.group({
            classId: this.classId,
            month: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
            year: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(2200)]],
            classSessionPrice: ['', [Validators.required, Validators.min(0)]],
          })
          
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

  calculateFee(): void {
    if (this.formGroup2.invalid) {
      return;
    }

    const { classId, month, year, classSessionPrice } = this.formGroup2.value;

    this.feeService.calculateNewFee(classId, month, year, classSessionPrice).subscribe({
      next: () => {
        this.loadTutorFee(classId);
        this.showToast('success', 'Tính học phí thành công')
      },
      error: (error) => {
        switch (error.error.error) {
          case 'Not found schedule!':
            this.showToast('error', 'Lớp không có lịch học');
            break;
          case 'Not found attendance!':
            this.showToast('error', 'Lớp không có thông tin điểm danh')
            break;
          case 'Existed!':
            this.showToast('warning', 'Học phí đã tồn tại')
            break;
          default:
            this.showToast('error', 'Có lỗi khi tính học phí')
            break;
        }
      }
    });
  }

  applyFilterFee(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceFee.filter = filterValue.trim().toLowerCase();
  }

  private loadTutorFee(classId: number): void {
    this.feeService.searchTutorFees(classId).subscribe({
      next: (response: any) => {
        const mappedData = response.map((item: TutorFeeDto) => ({
          id: item.id,
          year: item.year,
          month: item.month,
          totalLesson: item.totalLesson,
          lessonPrice: item.lessonPrice,
          feeEstimate: item.feeEstimate,
          feeCollected: item.feeCollected,
          feeNotCollected: item.feeNotCollected,
          createdDate: item.createdDate
        }));
        this.dataSourceFee.data = mappedData;
      },
      error: () => {
        this.showToast('error', 'Tải học phí không thành công');
      },
    });
  }

  openStudentListDialog(tutorFeeId: number) {
    this.tutorFeeId = tutorFeeId;

    const dialog1 = this.dialog.open(this.dialogTemplateFeeDetails, {
      width: '85%',
      maxHeight: '95vh',
    });

    dialog1.afterOpened().subscribe(() => {
      this.dataSourceFeeDetails.paginator = this.paginatorFeeDetails;
      this.dataSourceFeeDetails.sort = this.sortFeeDetails;
    });

    this.loadTutorFeeDetails(tutorFeeId);

    const selectedTutorFee = this.dataSourceFee.data
      .filter((item: any) => item.id === tutorFeeId)
      .map((item) => ({
        id: item.id,
        year: item.year,
        month: item.month,
        totalLesson: item.totalLesson,
        lessonPrice: item.lessonPrice,
        feeEstimate: item.feeEstimate,
        feeCollected: item.feeCollected,
        feeNotCollected: item.feeNotCollected,
        createdDate: item.createdDate
      })
    );

    this.selectedTutorFee = selectedTutorFee[0];

    this.formGroup3 = this.fb.group({
      tutorFeeId: this.tutorFeeId,
      re_classSessionPrice: [{ value: this.selectedTutorFee.lessonPrice, disabled: true }, [Validators.required, Validators.min(0)]],
    })

    dialog1.afterClosed().subscribe(() => {
      this.isEditing = false;
      this.formGroup3.disable;
      this.resetFilter();
    });
  }

  applyFilterFeeDetails(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceFeeDetails.filter = filterValue.trim().toLowerCase();
  }

  resetFilter(): void {
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }
    this.applyFilterFeeDetails({ target: { value: '' } } as unknown as Event);
  }

  private loadTutorFeeDetails(tutorFeeId: number): void {
    this.feeService.getTutorFeeDetailsByTutorFeeId(tutorFeeId).subscribe({
      next: (response: any) => {
        const activeData = response.map((item: TutorFeeDetailDto) => ({
          id: item.id,
          studentName: item.studentName,
          email: item.email,
          phone: item.phone,
          numberOfClassesAttended: item.numberOfClassesAttended,
          totalNumberOfClasses: item.totalNumberOfClasses,
          feeAmount: item.feeAmount,
          feeSubmitted: item.feeSubmitted,
          feeNotSubmitted: item.feeNotSubmitted,
          year: item.year,
          month: item.month,
          lessionPrice: item.lessonPrice
        }));

        if (activeData.length === 0) {
          this.activeBtn = false;
        }

        else {
          this.dataSourceFeeDetails.data = activeData;
        }
      },
      error: () => {
        this.showToast('error', 'Lỗi khi tải chi tiết học phí')
      },
    });
  }

  enableEditing() {
    this.isEditing = true;
    this.formGroup3.enable();
  }

  reCalculateFee(): void {
    if (this.formGroup3.invalid) {
      return;
    }

    const { tutorFeeId, re_classSessionPrice } = this.formGroup3.value;

    this.feeService.reCalculateFee(tutorFeeId, re_classSessionPrice).subscribe({
      next: () => {
        this.showToast('success', 'Tính lại học phí thành công');
        this.loadTutorFeeDetails(this.tutorFeeId);
        this.loadTutorFee(this.classId);
        this.formGroup3.disable();
        this.isEditing = false;
        this.selectedTutorFee.lessonPrice = re_classSessionPrice;
      },
      error: () => {
        this.showToast('error', 'Tính lại học phí không thành công');
        this.cancelEditing();
      }
    });
  }

  cancelEditing() {
    this.isEditing = false;
    this.formGroup3.patchValue({re_classSessionPrice: this.selectedTutorFee.lessonPrice});
    this.formGroup3.disable();
  }

  sendEmailTutorFeeToStudent() {
    this.isLoading = true;

    this.feeService.sendTutorFeeNotification(this.classId, this.selectedTutorFee.month, this.selectedTutorFee.year, this.selectedTutorFee.lessonPrice).subscribe({
      next: () => {
        this.isLoading = false;
        this.showToast('success', "Gửi email thành công")
      },
      error: () => {
        this.isLoading = false;
        this.showToast('error', "Không thể gửi email")
      },
    });
  }

  downloadTutorFeeTable() {
    this.feeService.downloadTutorFeeResults(this.classId, this.selectedTutorFee.month, this.selectedTutorFee.year, this.selectedTutorFee.lessonPrice).subscribe({
      next: (response: Blob) => {
        const fileURL = window.URL.createObjectURL(response);
        const anchor = document.createElement('a');
        anchor.href = fileURL;
        anchor.download = `hoc_phi_${this.selectedTutorFee.month}_${this.selectedTutorFee.year}_lop_${this.classId}.xlsx`;
        anchor.click();

        window.URL.revokeObjectURL(fileURL);

        this.showToast('success', 'Tải file thành công')
      },
      error: () => {
        this.showToast('error', 'Không thể tải file')
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
