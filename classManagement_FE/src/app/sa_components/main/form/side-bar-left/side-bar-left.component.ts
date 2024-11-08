import { Component } from '@angular/core';
import { IconComponent } from "../../../../shared/components/icon/icon.component";
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { admin_EMenuLabels, client_EMenuLabels, teacher_EMenuLabels } from '../../../../core/enums/menuLabels.enum';
import { EMenuLabels } from '../../../../core/enums/menuLabels.enum';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { UserResponse } from '../../../../core/interfaces/response.interface';
import { MatMenuModule } from '@angular/material/menu';
import Swal from 'sweetalert2';

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

  isAdminLoggedIn!: boolean;
  isTeacherLoggedIn!: boolean;
  isStudentLoggedIn!: boolean;
  
  isHovering = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.authService.getToken()) {
      this.authService.setCurrentUser().subscribe((res) => {
        this.user = res;
        this.updateUserLoggedStatus();
      })
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
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });
    Toast.fire({
      icon: 'success',
      title: 'Đăng xuất thành công!',
    });
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
      icon: 'home',
      label: client_EMenuLabels.Home,
      routerLink: '/home',
    },
    {
      icon: 'playlist_add',
      label: client_EMenuLabels.Wish,
      routerLink: '/wish',
    },
    {
      icon: 'groups',
      label: EMenuLabels.TeamWorking,
      routerLink: 'off-day-project-for-user',
    },
    {
      icon: 'supervised_user_circle',
      label: EMenuLabels.TimesheetsMonitoring,
      routerLink: 'timesheets-supervisior',
    },
    { 
      icon: 'event_note', 
      label: EMenuLabels.Retro, 
      routerLink: 'retro' 
    },
    {
      icon: 'rate_review',
      label: EMenuLabels.ReviewInterns,
      routerLink: 'review',
    },
    { 
      icon: 'description', 
      label: EMenuLabels.Report, 
      routerLink: 'report' 
    },
  ];
}
