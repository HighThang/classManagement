import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
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
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import Swal from 'sweetalert2';
import { ClassroomService } from '../../../../core/services/classroom/classroom.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FeeService } from '../../../../core/services/fee/fee.service';

@Component({
  selector: 'app-tea-payment',
  standalone: true,
  imports: [MatTabsModule, MatListModule, CommonModule, MatProgressSpinnerModule, MatDialogModule, MatSnackBarModule, MatTableModule, MatButtonModule,
    MatInputModule, MatIconModule, MatToolbarModule, RouterModule, FormsModule, MatPaginatorModule, SharedModule, MatSortModule, ReactiveFormsModule, 
    MatOptionModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatSelectModule, MatCheckboxModule],
  templateUrl: './tea-payment.component.html',
  styleUrl: './tea-payment.component.scss',
})
export class TeaPaymentComponent implements OnInit, AfterViewInit {
  isEditing = false;
  classId!: number;
  availableClasses: string[] = [];
  filters: { [key: string]: string } = {};
  originalData: any[] = [];

  displayedColumns: string[] = ['id', 'year', 'month', 'className', 'lastName', 'surname', 'firstName', 'email', 'phone', 'feeNotSubmitted', 'pay'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChild('sort') sort!: MatSort;

  constructor(
    private classroomService: ClassroomService,
    public dialog: MatDialog,
    private feeService: FeeService
  ) {}

  ngOnInit(): void {
    this.loadClassrooms();

    this.loadTutorFeeDetails();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadClassrooms(): void {
    this.classroomService.getClassrooms().subscribe((data) => {
      this.availableClasses = data.map((cls) => cls.className);
    });
  }

  loadTutorFeeDetails(): void {
    const params = { };
    this.feeService.getStudentNotSubmittedTutorFee(params).subscribe({
      next: (response: any) => {
        this.originalData = response.data;
        this.dataSource.data = response.data;

        this.reapplyFilters();
      },
      error: () => {
        this.showToast('error', 'Lỗi khi tải dữ liệu học phí');
      },
    });
  }

  onInputChange(key: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value || '';
    this.applyFilter(key, value);
  }  

  applyFilter(key: string, value: string): void {
    if (key === 'className' && value === null) {
      delete this.filters[key];
    } else {
      this.filters[key] = value?.trim().toLowerCase();
    }  

    this.dataSource.data = this.originalData.filter((item) => {
      return Object.keys(this.filters).every((filterKey) => {
        if (!this.filters[filterKey]) return true;
  
        const filterValue = this.filters[filterKey];
        if (filterKey === 'name') {
          const fullName = `${item.lastName ?? ''} ${item.surname ?? ''} ${item.firstName ?? ''}`.toLowerCase();
          return fullName.includes(filterValue);
        } else {
          const itemValue = item[filterKey]?.toString().toLowerCase();
          return itemValue?.includes(filterValue);
        }
      });
    });
  }

  reapplyFilters(): void {
    this.dataSource.data = this.originalData.filter((item) => {
      return Object.keys(this.filters).every((filterKey) => {
        if (!this.filters[filterKey]) return true;
  
        const filterValue = this.filters[filterKey];
        if (filterKey === 'name') {
          const fullName = `${item.lastName ?? ''} ${item.surname ?? ''} ${item.firstName ?? ''}`.toLowerCase();
          return fullName.includes(filterValue);
        } else {
          const itemValue = item[filterKey]?.toString().toLowerCase();
          return itemValue?.includes(filterValue);
        }
      });
    });
  }
  
  pay(feeDetailId: number) {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: 'Bạn muốn xác nhận thanh toán?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#218838',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        this.feeService.updateSubmiteedTutorFee(feeDetailId).subscribe(
          () => {
            this.loadTutorFeeDetails();
            this.showToast('success', 'Xác nhận thành công');
          },
          () => {
            this.showToast('error', 'Xác nhận thất bại');
          }
        )
      }
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