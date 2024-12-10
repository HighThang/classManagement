import { Component } from '@angular/core';
import { IconComponent } from "../../../../shared/components/icon/icon.component";
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { admin_EMenuLabels, client_EMenuLabels, student_EMenuLabels, teacher_EMenuLabels } from '../../../../core/enums/menuLabels.enum';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { UserResponse } from '../../../../core/interfaces/response.interface';
import { MatMenuModule } from '@angular/material/menu';
import Swal from 'sweetalert2';
import { ImageService } from '../../../../core/services/image/image.service';

@Component({
  selector: 'app-side-bar-left',
  standalone: true,
  imports: [IconComponent, CommonModule, RouterModule, MatIconModule, MatMenuModule],
  templateUrl: './side-bar-left.component.html',
  styleUrl: './side-bar-left.component.scss'
})
export class SideBarLeftComponent {
  user!: UserResponse | null;
  currentUser: string = 'client'; 
  selectedImage: string | null = null;

  isAdminLoggedIn!: boolean;
  isTeacherLoggedIn!: boolean;
  isStudentLoggedIn!: boolean;
  
  isHovering = false;

  constructor(private authService: AuthService, private imageService: ImageService) {}

  ngOnInit() {
    const userData = sessionStorage.getItem('currentUser');

    if (localStorage.getItem('accessToken')) {
      if (userData) {
        this.user = JSON.parse(userData) as UserResponse;
        this.updateUserLoggedStatus();
      }
  
      else {
        this.authService.setCurrentUser().subscribe({
          next: (res) => {
            this.user = res;
            this.updateUserLoggedStatus();
          },
          error: () => {
            localStorage.removeItem('accessToken');
          }
        })
      }

      this.authService.userUpdated$.subscribe((updatedUser) => {
        this.user = updatedUser;
        this.loadImage(this.user?.imageURL!);
      });

      this.loadImage(this.user?.imageURL!);
    }
  }

  updateUserLoggedStatus() {
    this.isAdminLoggedIn = this.authService.isAdminLoggedIn();
    this.isTeacherLoggedIn = this.authService.isTeacherLoggedIn();
    this.isStudentLoggedIn = this.authService.isStudentLoggedIn();
  }

  logout() {
    this.authService.logout();
    this.updateUserLoggedStatus();
    const Toast = Swal.mixin({
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
    Toast.fire({
      icon: 'success',
      title: 'Đăng xuất thành công!',
    });
  }

  loadImage(imagePath: string | null): void {
    if (imagePath) {
      this.imageService.getImage().subscribe(
        (imageBlob: Blob) => {
          const imageUrl = URL.createObjectURL(imageBlob);
          this.selectedImage = imageUrl;
        },
        () => {
          this.selectedImage = null;
        }
      );
    }
  }

  client_menuItems = [
    {
      icon: 'home',
      label: client_EMenuLabels.Home,
      routerLink: '/home',
    },
    { 
      icon: 'account_box', 
      label: client_EMenuLabels.Login, 
      routerLink: '/login' 
    },
    {
      icon: 'playlist_add',
      label: client_EMenuLabels.Wish,
      routerLink: '/wish',
    },
    {
      icon: 'assignment',
      label: client_EMenuLabels.Register,
      routerLink: '/register',
    },
  ];

  admin_menuItems = [
    {
      icon: 'library_books',
      label: admin_EMenuLabels.ManageCourse,
      routerLink: '/admin/manage_course',
    },
    {
      icon: 'school',
      label: admin_EMenuLabels.ManageTeacher,
      routerLink: '/admin/manage_tea',
    },
    {
      icon: 'group',
      label: admin_EMenuLabels.ManageStudent,
      routerLink: '/admin/manage_stu',
    },
  ];

  teacher_menuItems = [
    {
      icon: 'date_range',
      label: teacher_EMenuLabels.Schedule,
      routerLink: '/teacher/schedule',
    },
    {
      icon: 'app_registration',
      label: teacher_EMenuLabels.Course,
      routerLink: '/teacher/course',
    },
    {
      icon: 'class',
      label: teacher_EMenuLabels.ManageClass,
      routerLink: '/teacher/manage_class',
    },
    {
      icon: 'assignment_turned_in',
      label: teacher_EMenuLabels.Attendance,
      routerLink: '/teacher/attendance',
    },
    {
      icon: 'grade',
      label: teacher_EMenuLabels.Score,
      routerLink: '/teacher/score',
    },
    {
      icon: 'calculate',
      label: teacher_EMenuLabels.Fee,
      routerLink: '/teacher/fee',
    },
    {
      icon: 'payment',
      label: teacher_EMenuLabels.Payment,
      routerLink: '/teacher/payment',
    },
    {
      icon: 'person',
      label: teacher_EMenuLabels.Info,
      routerLink: '/teacher/info',
    },
  ];

  student_menuItems = [
    {
      icon: 'date_range',
      label: student_EMenuLabels.Schedule,
      routerLink: '/student/schedule',
    },
    {
      icon: 'playlist_add',
      label: student_EMenuLabels.Course,
      routerLink: '/student/course',
    },
    {
      icon: 'class',
      label: student_EMenuLabels.ClassList,
      routerLink: '/student/class',
    },
    {
      icon: 'assignment_turned_in',
      label: student_EMenuLabels.Attendance,
      routerLink: '/student/attendance',
    },
    { 
      icon: 'grade', 
      label: student_EMenuLabels.Score, 
      routerLink: '/student/score' 
    },
    {
      icon: 'payment',
      label: student_EMenuLabels.Fee,
      routerLink: '/student/fee',
    },
    { 
      icon: 'person', 
      label: student_EMenuLabels.Info, 
      routerLink: '/student/info' 
    },
  ];
}
