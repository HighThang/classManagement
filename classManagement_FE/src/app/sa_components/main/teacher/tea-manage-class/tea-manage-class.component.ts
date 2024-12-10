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
  selector: 'app-tea-manage-class',
  standalone: true,
  imports: [ MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatIconModule, SharedModule, DatePipe,
    MatButtonModule, MatDialogModule, FormsModule, MatOptionModule, ReactiveFormsModule, CommonModule, MatInputModule, MatSelectModule, MatOptionModule ],
  templateUrl: './tea-manage-class.component.html',
  styleUrl: './tea-manage-class.component.scss',
})
export class TeaManageClassComponent implements OnInit, AfterViewInit {
  private router = inject(Router);

  displayedColumns: string[] = ['id','className','subjectName','note','createdDate','attendance','score','fee','details'];
  dataSource = new MatTableDataSource<Classroom>();
  resultsLength = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('dialogTemplate') dialogTemplate: any;

  formGroup!: FormGroup;

  subjects: Course[] = [];

  constructor(
    private classroomService: ClassroomService,
    private courseService: CourseService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.fetchSubjects();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loadData();
  }

  private initForm(): void {
    this.formGroup = this.fb.group({
      className: ['', [Validators.required]],
      selectedSubject: ['', [Validators.required]],
      notes: [''],
    });
  }

  loadData(): void {
    this.classroomService.getClassrooms().subscribe((data) => {
      this.dataSource.data = data;
      this.resultsLength = data.length;
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

  saveClass(): void {
    if (this.formGroup.invalid) {
      return;
    }

    const formValues = this.formGroup.value;
    const classData: Classroom = {
      className: formValues.className,
      subjectName:
        this.subjects.find((s) => s.id === +formValues.selectedSubject)
          ?.subName || '',
      note: formValues.notes || '',
    };

    this.classroomService.createClassroom(classData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Tạo lớp học thành công!',
          toast: true,
          position: 'bottom-end',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        this.loadData();
        this.dialog.closeAll();
        this.formGroup.reset();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Tạo lớp học thất bại!',
          text: 'Vui lòng thử lại.',
          toast: true,
          position: 'bottom-end',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      },
    });
  }

  openDialog(): void {
    this.dialog.open(this.dialogTemplate);
  }

  private fetchSubjects(): void {
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        this.subjects = courses;
      },
      error: (err) => {
        console.error('Error fetching subjects:', err);
      },
    });
  }
}
