import { Component } from '@angular/core';
import { IconComponent } from "../../../../shared/components/icon/icon.component";
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { admin_EMenuLabels, client_EMenuLabels } from '../../../../core/enums/menuLabels.enum';
import { EMenuLabels } from '../../../../core/enums/menuLabels.enum';
import { WishComponent } from '../../client/wish/wish.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-side-bar-left',
  standalone: true,
  imports: [IconComponent, CommonModule, RouterModule, RouterOutlet, WishComponent, MatIconModule],
  templateUrl: './side-bar-left.component.html',
  styleUrl: './side-bar-left.component.scss'
})
export class SideBarLeftComponent {
  // user!: IUserInformation | null;
  // destroy$ = new Subject<void>();

  // constructor(
  //   private authService: AuthService,
  // ) {}

  // ngOnInit(): void {
  //   this.authService
  //     .getCurrentLoginInfor()
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe((res) => {
  //       this.user = res?.result?.user;
  //     });
  // }

  // ngOnDestroy(): void {
  //   this.destroy$.next();
  //   this.destroy$.complete();
  // }

  // logout() {
  //   this.authService.logout();
  //   const Toast = Swal.mixin({
  //     toast: true,
  //     position: 'bottom-end',
  //     showConfirmButton: false,
  //     timer: 3000,
  //     timerProgressBar: true,
  //     didOpen: (toast) => {
  //       toast.onmouseenter = Swal.stopTimer;
  //       toast.onmouseleave = Swal.resumeTimer;
  //     },
  //   });
  //   Toast.fire({
  //     icon: 'success',
  //     title: 'Logout successfully!',
  //   });
  // }

  currentUser: string = 'client'; 

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
      icon: 'home',
      label: client_EMenuLabels.Home,
      routerLink: '/home',
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
      icon: 'home',
      label: client_EMenuLabels.Home,
      routerLink: '/home',
    },
    {
      icon: 'date_range',
      label: EMenuLabels.ManageTimesheet,
      routerLink: 'timesheets',
    },
    {
      icon: 'rule',
      label: EMenuLabels.ManageRequest,
      routerLink: 'off-day-project',
    },
    {
      icon: 'access_time',
      label: EMenuLabels.ManageWorking,
      routerLink: 'manage-working-times',
    },
  ];

  student_menuItems = [
    {
      icon: 'home',
      label: client_EMenuLabels.Home,
      routerLink: '/home',
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
    {
      icon: 'playlist_add',
      label: client_EMenuLabels.Wish,
      routerLink: '/wish',
    },
  ];
}
