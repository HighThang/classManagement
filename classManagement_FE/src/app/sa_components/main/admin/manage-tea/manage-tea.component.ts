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
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    SharedModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    MatOptionModule,
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatTabsModule,
  ],
  templateUrl: './manage-tea.component.html',
  styleUrl: './manage-tea.component.scss',
})
export class ManageTeaComponent implements AfterViewInit {
  displayedColumns1: string[] = ['id','username','email','phone','lastName','surname','firstName','dob','active','deleted',];
  displayedColumns2: string[] = ['id','username','email','phone','lastName','surname','firstName','dob','disable',];
  displayedColumns3: string[] = ['id','username','email','phone','lastName','surname','firstName','dob','active',];

  dataSource1 = new MatTableDataSource<Teacher>();
  dataSource2 = new MatTableDataSource<Teacher>();
  dataSource3 = new MatTableDataSource<Teacher>();
  resultsLength = 0;

  @ViewChild('paginator1') paginator1!: MatPaginator;
  @ViewChild('paginator2') paginator2!: MatPaginator;
  @ViewChild('paginator3') paginator3!: MatPaginator;
  
  @ViewChild('sort1') sort1!: MatSort;
  @ViewChild('sort2') sort2!: MatSort;
  @ViewChild('sort3') sort3!: MatSort;

  constructor(private adminService: AdminService) {}

  applyFilter1(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource1.filter = filterValue.trim().toLowerCase();
  }

  applyFilter2(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
  }

  applyFilter3(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource3.filter = filterValue.trim().toLowerCase();
  }

  ngAfterViewInit(): void {
    this.dataSource1.paginator = this.paginator1;
    this.dataSource1.sort = this.sort1;

    this.dataSource2.paginator = this.paginator2;
    this.dataSource2.sort = this.sort2;

    this.dataSource3.paginator = this.paginator3;
    this.dataSource3.sort = this.sort3;

    this.loadDataPending();
    this.loadDataActive();
    this.loadDataDisable();
  }

  loadDataPending(): void {
    this.adminService.getPendingTeachers().subscribe((data) => {
      this.dataSource1.data = data;
    });
  }
  
  loadDataActive(): void {
    this.adminService.getActiveTeachers().subscribe((data) => {
      this.dataSource2.data = data;
    });
  }
  
  loadDataDisable(): void {
    this.adminService.getDisabledTeachers().subscribe((data) => {
      this.dataSource3.data = data;
    });
  }

  activateTeacher(teacherId: number): void {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: 'Bạn muốn kích hoạt?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#218838',
      cancelButtonColor: '#d33',
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
      title: 'Bạn có chắc chắn?',
      text: 'Bạn muốn hủy kích hoạt?',
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
