import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../../../shared/shared.module';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { Classroom, ClassroomService } from '../../../../core/services/classroom/classroom.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-stu-class-list',
  standalone: true,
  imports: [ MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatIconModule, SharedModule, DatePipe,
    MatButtonModule, MatDialogModule, FormsModule, MatOptionModule, ReactiveFormsModule, CommonModule, MatInputModule, MatSelectModule, MatOptionModule ],
  templateUrl: './stu-class-list.component.html',
  styleUrl: './stu-class-list.component.scss'
})
export class StuClassListComponent implements AfterViewInit {
  private router = inject(Router);

  displayedColumnsActive: string[] = ['id','className','subjectName','note','createdDate','attendance','score','fee','details'];
  dataSourceActive = new MatTableDataSource<Classroom>();
  displayedColumnsDisable: string[] = ['id','className','subjectName','note','createdDate','attendance','score','fee','details'];
  dataSourceDisable = new MatTableDataSource<Classroom>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('paginatorDisable') paginatorDisable!: MatPaginator;
  @ViewChild('sortDisable') sortDisable!: MatSort;

  constructor(
    private classroomService: ClassroomService,
  ) {}

  ngAfterViewInit(): void {
    this.dataSourceActive.paginator = this.paginator;
    this.dataSourceActive.sort = this.sort;
    this.dataSourceDisable.paginator = this.paginatorDisable;
    this.dataSourceDisable.sort = this.sortDisable;
    this.loadData();
  }

  loadData(): void {
    this.classroomService.getClassroomsForStudent({}).subscribe({
      next: (response) => {
        const activeData = response
          .filter((item: any) => item.active === true && item.deleted === false)
          .map((item: any) => (item.classroom));
  
        const inactiveData = response
          .filter((item: any) => item.active === false && item.deleted === true)
          .map((item: any) => (item.classroom));

        this.dataSourceActive.data = activeData; 
        this.dataSourceDisable.data = inactiveData; 
      },
      error: () => {
        this.showToast('error', 'Lỗi khi tải dữ liệu lớp học')
      },
    });
  }

  applyFilterActive(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceActive.filter = filterValue.trim().toLowerCase();
  }

  applyFilterDisable(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceDisable.filter = filterValue.trim().toLowerCase();
  }

  navigateTo(path: string, id: number): void {
    this.router.navigate([path]);
    sessionStorage.setItem('currentClassId', id.toString());
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
