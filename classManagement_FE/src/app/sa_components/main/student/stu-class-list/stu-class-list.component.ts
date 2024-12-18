import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { Course, CourseService } from '../../../../core/services/course/course.service';
import { MatSelectModule } from '@angular/material/select';
import { Classroom, ClassroomService } from '../../../../core/services/classroom/classroom.service';
import { Validators } from '@angular/forms';
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

  displayedColumns: string[] = ['id','className','subjectName','note','createdDate','attendance','score','fee','details'];
  dataSource = new MatTableDataSource<Classroom>();
  displayedColumns2: string[] = ['id','className','subjectName','note','createdDate','attendance','score','fee','details'];
  dataSource2 = new MatTableDataSource<Classroom>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('paginator2') paginator2!: MatPaginator;
  @ViewChild('sort2') sort2!: MatSort;

  constructor(
    private classroomService: ClassroomService,
  ) {}

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource2.paginator = this.paginator2;
    this.dataSource2.sort = this.sort2;
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

        this.dataSource.data = activeData; 
        this.dataSource2.data = inactiveData; 
      },
      error: () => {
        this.showToast('error', 'Lỗi khi tải dữ liệu lớp học')
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  applyFilter2(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
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
