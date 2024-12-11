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
  resultsLength = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private classroomService: ClassroomService,
  ) {}

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loadData();
  }

  loadData(): void {
    // const page = this.paginator?.pageIndex || 0;
    // const size = this.paginator?.pageSize || 10;
    // const sort = this.sort?.active
    //   ? `${this.sort.active},${this.sort.direction || 'asc'}`
    //   : 'id,asc';

    this.classroomService
      .getClassroomsForStudent({})
      .subscribe({
        next: (response) => {
          this.dataSource.data = response; 
        },
        error: (error) => {
          console.error('Error fetching classrooms:', error);
        },
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  navigateTo(path: string, id: number): void {
    this.router.navigate([path]);
    sessionStorage.setItem('currentClassId', id.toString());
  }
}
