import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
import { FormGroup, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from '../../../../shared/shared.module';
import { Student } from '../../../../core/services/admin/admin.service';
import { MatSort, MatSortModule } from '@angular/material/sort';
import Swal from 'sweetalert2';

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

  displayedColumns1: string[] = ['id', 'email', 'lastName', 'surname', 'firstName', 'phone', 'dob', 'deleted'];
  dataSource1 = new MatTableDataSource<Student>();
  displayedColumns2: string[] = ['id', 'day', 'periodInDay', 'dayInWeek', 'createdDate', 'deleted'];
  dataSource2 = new MatTableDataSource<ScheduleData>();

  @ViewChild('paginator1') paginator1!: MatPaginator;
  @ViewChild('sort1') sort1!: MatSort;
  @ViewChild('paginator2') paginator2!: MatPaginator;
  @ViewChild('sort2') sort2!: MatSort;
  @ViewChild('dialogTemplate1') dialogTemplate1: any;
  @ViewChild('dialogTemplate2') dialogTemplate2: any;
  @ViewChild('dialogTemplate3') dialogTemplate3: any;

  constructor(
    private classDetailsService: ClassDetailsService,
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.classId = this.route.snapshot.params['id'];
    this.classDetails = {
      id: 0,
      subjectName: '',
      createdDate: '',
      note: '',
      className: '',
    };

    this.loadClassDetails();
    this.loadStudents();
    this.loadSchedules();
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

  private loadStudents(): void {
    this.classDetailsService.getStudents(this.classId!).subscribe({
      next: (response: any) => {
        const mappedData = response.content.map((item: any) => ({
          id: item.student.id,
          email: item.student.email,
          firstName: item.student.firstName,
          surname: item.student.surname,
          lastName: item.student.lastName,
          phone: item.student.phone,
          dob: new Date(item.student.dob).toLocaleDateString('vi-VN'),
        }));
        this.dataSource1.data = mappedData;
      },
      error: (err) => {
        console.error('Error fetching students:', err);
      },
    });
  }

  openAddStudentDialog() {
    this.dialog.open(this.dialogTemplate1);
  }

  openWaitingListDialog() {
    this.dialog.open(this.dialogTemplate2);
  }

  downloadStudentList() {
    // Handle downloading the student list
  }

  deleteStudent(student: any) {
    // Handle deleting student
  }

  // Schedules
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
          createdDate: new Date(item.createdDate).toLocaleDateString('vi-VN'), 
        }));
        this.dataSource2.data = mappedData;
      },
      error: (err) => {
        console.error('Error fetching schedules:', err);
      },
    });
  }

  openAddScheduleDialog() {
    this.dialog.open(this.dialogTemplate3);
  }

  deleteSchedule(schedule: any) {
    // Handle deleting schedule
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
  private loadDocuments() {
    this.classDetailsService.getDocuments(this.classId!).subscribe((data) => {
      // this.documents = data.content || [];
    });
  }

  openUploadDocumentDialog() {
    // Open dialog to upload document
  }

  deleteDocument(doc: any) {
    // Handle deleting document
  }

  refresh(): void {
    this.loadStudents();
    this.loadSchedules();
    this.loadDocuments();
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
