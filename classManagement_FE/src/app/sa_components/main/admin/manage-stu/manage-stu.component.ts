import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { AdminService, Student } from '../../../../core/services/admin/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage-stu',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatIconModule, SharedModule,  MatButtonModule, MatDialogModule, 
    FormsModule, MatOptionModule, ReactiveFormsModule, CommonModule, MatInputModule, MatSelectModule, MatOptionModule, MatTabsModule],
  templateUrl: './manage-stu.component.html',
  styleUrl: './manage-stu.component.scss'
})
export class ManageStuComponent implements AfterViewInit {
  displayedColumnsActive: string[] = ['id','email','phone','lastName','surname','firstName','dob','disable',];
  displayedColumnsDisable: string[] = ['id','email','phone','lastName','surname','firstName','dob','active',];

  dataSourceActive = new MatTableDataSource<Student>();
  dataSourceDisable = new MatTableDataSource<Student>();

  @ViewChild('paginatorActive') paginatorActive!: MatPaginator;
  @ViewChild('paginatorDisable') paginatorDisable!: MatPaginator;
  
  @ViewChild('sortActive') sortActive!: MatSort;
  @ViewChild('sortDisable') sortDisable!: MatSort;

  constructor(private adminService: AdminService) {}

  applyFilterActive(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceActive.filter = filterValue.trim().toLowerCase();
  }

  applyFilterDisable(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceDisable.filter = filterValue.trim().toLowerCase();
  }

  ngAfterViewInit(): void {
    this.dataSourceActive.paginator = this.paginatorActive;
    this.dataSourceActive.sort = this.sortActive;

    this.dataSourceDisable.paginator = this.paginatorDisable;
    this.dataSourceDisable.sort = this.sortDisable;

    this.loadDataActive();
    this.loadDataDisable();
  }
  
  loadDataActive(): void {
    this.adminService.getActiveStudents().subscribe((data) => {
      this.dataSourceActive.data = data;
    });
  }
  
  loadDataDisable(): void {
    this.adminService.getDisabledStudents().subscribe((data) => {
      this.dataSourceDisable.data = data;
    });
  }

  activateStudent(studentId: number): void {
    Swal.fire({
      title: 'Bạn chắc chắn?',
      text: 'Bạn muốn kích hoạt học sinh này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#218838',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Kích hoạt',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.activateStudent(studentId).subscribe({
          next: () => {
            Swal.fire('Thành công', 'Kích hoạt thành công.', 'success');
            this.refreshStudents();
          },
          error: () => {
            Swal.fire('Lỗi', 'Không thể kích hoạt.', 'error');
          },
        });
      }
    });
  }
  
  disableStudent(studentId: number): void {
    Swal.fire({
      title: 'Bạn chắc chắn?',
      text: 'Bạn muốn hủy kích hoạt học sinh này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.disableStudent(studentId).subscribe({
          next: () => {
            Swal.fire('Thành công', 'Hủy kích hoạt thành công.', 'success');
            this.refreshStudents();
          },
          error: () => {
            Swal.fire('Lỗi', 'Không thể hủy.', 'error');
          },
        });
      }
    });
  }

  refreshStudents(): void {
    this.loadDataActive();
    this.loadDataDisable();
  }
}
