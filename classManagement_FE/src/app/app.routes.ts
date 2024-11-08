import { Routes } from '@angular/router';
import { MainComponent } from './sa_components/main/main.component';
import { NotFoundComponent } from './sa_components/not-found/not-found.component';
import { provideHttpClient } from '@angular/common/http';
import { clientGuard } from './core/guards/client-guard/client.guard';
import { LoginComponent } from './sa_components/main/client/login/login.component';
import { ManageStuComponent } from './sa_components/main/admin/manage-stu/manage-stu.component';
import { RegisterComponent } from './sa_components/main/client/register/register.component';
import { WishComponent } from './sa_components/main/client/wish/wish.component';
import { HomeComponent } from './sa_components/main/form/home/home.component';
import { ManageTeaComponent } from './sa_components/main/admin/manage-tea/manage-tea.component';
import { TeaInfoComponent } from './sa_components/main/teacher/tea-info/tea-info.component';
import { TeaPaymentComponent } from './sa_components/main/teacher/tea-payment/tea-payment.component';
import { TeaFeeComponent } from './sa_components/main/teacher/tea-fee/tea-fee.component';
import { TeaScoreComponent } from './sa_components/main/teacher/tea-score/tea-score.component';
import { TeaAttendanceComponent } from './sa_components/main/teacher/tea-attendance/tea-attendance.component';
import { TeaManageClassComponent } from './sa_components/main/teacher/tea-manage-class/tea-manage-class.component';
import { TeaScheduleComponent } from './sa_components/main/teacher/tea-schedule/tea-schedule.component';
import { TeaCourseComponent } from './sa_components/main/teacher/tea-course/tea-course.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent,
        title: 'Trang chủ',
      },
      {
        path: 'login',
        canActivate: [clientGuard],
        component: LoginComponent,
        title: 'Đăng nhập',
        providers: [provideHttpClient()],
      },
      {
        path: 'wish',
        canActivate: [clientGuard],
        component: WishComponent,
        title: 'Nguyện vọng môn học',
      },
      {
        path: 'register',
        canActivate: [clientGuard],
        component: RegisterComponent, 
        title: 'Đăng ký tài khoản giáo viên'
      }
    ],
  },
  {
    path: 'admin',
    canActivate: [],
    component: MainComponent,
    children: [
      {
        path: 'manage_stu',
        component: ManageStuComponent,
        title: 'Quản lý học sinh',
      },
      {
        path: 'manage_tea',
        component: ManageTeaComponent,
        title: 'Quản lý giáo viên',
      },
    ],
  },
  {
    path: 'teacher',
    canActivate: [],
    component: MainComponent,
    children: [
      {
        path: 'schedule',
        component: TeaScheduleComponent,
        title: 'Lịch trình giảng dạy',
      },
      {
        path: 'course',
        component: TeaCourseComponent,
        title: 'Đăng ký môn giảng dạy',
      },
      {
        path: 'manage_class',
        component: TeaManageClassComponent,
        title: 'Quản lý lớp dạy',
      },
      {
        path: 'attendance',
        component: TeaAttendanceComponent,
        title: 'Quản lý điểm danh',
      },
      {
        path: 'score',
        component: TeaScoreComponent,
        title: 'Quản lý điểm',
      },
      {
        path: 'fee',
        component: TeaFeeComponent,
        title: 'Tính toán học phí',
      },
      {
        path: 'payment',
        component: TeaPaymentComponent,
        title: 'Thanh toán học phí',
      },
      {
        path: 'info',
        component: TeaInfoComponent,
        title: 'Thông tin cá nhân',
      },
    ],
  },
  {
    path: 'student',
    canActivate: [],
    component: MainComponent,
    children: [],
  },
  { path: '**', component: NotFoundComponent, title: 'Trang không tồn tại' },
];
