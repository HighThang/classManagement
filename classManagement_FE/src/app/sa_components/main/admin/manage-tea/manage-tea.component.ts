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
import { AdminService } from '../../../../core/services/admin/admin.service';
import { Teacher } from '../../../../core/services/admin/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage-tea',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatIconModule, SharedModule, MatButtonModule, 
    MatDialogModule, FormsModule, MatOptionModule, ReactiveFormsModule, CommonModule, MatInputModule, MatSelectModule, MatOptionModule, MatTabsModule],
  templateUrl: './manage-tea.component.html',
  styleUrl: './manage-tea.component.scss',
})
export class ManageTeaComponent implements AfterViewInit {
  displayedColumnsPending: string[] = ['id','username','email','phone','lastName','surname','firstName','dob','active','deleted'];
  displayedColumnsActive: string[] = ['id','username','email','phone','lastName','surname','firstName','dob','disable'];
  displayedColumnsDisable: string[] = ['id','username','email','phone','lastName','surname','firstName','dob','active'];

  dataSourcePending = new MatTableDataSource<Teacher>();
  dataSourceActive = new MatTableDataSource<Teacher>();
  dataSourceDisable = new MatTableDataSource<Teacher>();

  @ViewChild('paginatorPending') paginatorPending!: MatPaginator;
  @ViewChild('paginatorActive') paginatorActive!: MatPaginator;
  @ViewChild('paginatorDisable') paginatorDisable!: MatPaginator;
  
  @ViewChild('sortPending') sortPending!: MatSort;
  @ViewChild('sortActive') sortActive!: MatSort;
  @ViewChild('sortDisable') sortDisable!: MatSort;

  constructor(private adminService: AdminService) {}

  applyFilterPending(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourcePending.filter = filterValue.trim().toLowerCase();
  }

  applyFilterActive(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceActive.filter = filterValue.trim().toLowerCase();
  }

  applyFilterDisable(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceDisable.filter = filterValue.trim().toLowerCase();
  }

  ngAfterViewInit(): void {
    this.dataSourcePending.paginator = this.paginatorPending;
    this.dataSourcePending.sort = this.sortPending;

    this.dataSourceActive.paginator = this.paginatorActive;
    this.dataSourceActive.sort = this.sortActive;

    this.dataSourceDisable.paginator = this.paginatorDisable;
    this.dataSourceDisable.sort = this.sortDisable;

    this.loadDataPending();
    this.loadDataActive();
    this.loadDataDisable();
  }

  loadDataPending(): void {
    this.adminService.getPendingTeachers().subscribe((data) => {
      this.dataSourcePending.data = data;
    });
  }
  
  loadDataActive(): void {
    this.adminService.getActiveTeachers().subscribe((data) => {
      this.dataSourceActive.data = data;
    });
  }
  
  loadDataDisable(): void {
    this.adminService.getDisabledTeachers().subscribe((data) => {
      this.dataSourceDisable.data = data;
    });
  }

  activateTeacher(teacherId: number): void {
    Swal.fire({
      title: 'Bạn chắc chắn?',
      text: 'Bạn muốn kích hoạt giáo viên này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#218838',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Kích hoạt',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.activateTeacher(teacherId).subscribe({
          next: () => {
            Swal.fire('Thành công', 'Kích hoạt thành công.', 'success');
            this.refreshTeachers();
          },
          error: () => {
            Swal.fire('Lỗi', 'Không thể kích hoạt.', 'error');
          },
        });
      }
    });
  }
  
  deleteTeacher(teacherId: number): void {
    Swal.fire({
      title: 'Bạn chắc chắn?',
      text: 'Bạn muốn hủy kích hoạt giáo viên này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteTeacher(teacherId).subscribe({
          next: () => {
            Swal.fire('Thành công', 'Hủy kích hoạt thành công.', 'success');
            this.refreshTeachers();
          },
          error: () => {
            Swal.fire('Lỗi', 'Không thể hủy.', 'error');
          },
        });
      }
    });
  }

  refreshTeachers(): void {
    this.loadDataPending();
    this.loadDataActive();
    this.loadDataDisable();
  }
}
