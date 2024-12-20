import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../../../shared/shared.module';
import { Course, CourseService } from '../../../../core/services/course/course.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule, NgModel } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tea-course',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, 
    MatIconModule, SharedModule, MatDialogModule, FormsModule, MatButtonModule, CommonModule],
  templateUrl: './tea-course.component.html',
  styleUrl: './tea-course.component.scss'
})
export class TeaCourseComponent implements AfterViewInit {
  displayedColumns: string[] = ['id', 'subName', 'teacherName'];
  dataSource = new MatTableDataSource<Course>();

  subjectName!: string;
  idTeacher!: number;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private courseService: CourseService, private dialog: MatDialog) {}

  ngAfterViewInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.courseService.getCourses().subscribe((courses) => {
      this.dataSource.data = courses;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialog(templateRef: any): void {
    const dialogRef = this.dialog.open(templateRef, {
      width: '40%', maxHeight: '60vh'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.subjectName = '';
    });
  }

  submitRequest(subjectNameCtrl: NgModel): void {
    if (subjectNameCtrl.invalid) {
      return; 
    }
  
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    const teacherId = currentUser.id;
  
    const courseData = {
      subName: this.subjectName,  
      idTeacher: teacherId,      
    };
  
    this.courseService.checkSubjectExists(this.subjectName).subscribe({
      next: (response) => {
        if (!response.exists) {
          this.courseService.addCourse(courseData).subscribe({
            next: () => {
              this.showToast('success', 'Gửi yêu cầu tạo môn học thành công')
              this.dialog.closeAll();
              this.loadCourses();
      
              this.subjectName = '';  
            },
            error: () => {
              this.showToast('error', 'Có lỗi xảy ra khi gửi yêu cầu')
            },
          });
        }
        else {
          this.showToast('error', 'Môn học đã tồn tại, hãy kiểm tra lại')
        }
      },
      error: () => {
        this.showToast('error', 'Có lỗi xảy ra khi kiểm tra môn học')
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