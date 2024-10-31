import { Routes } from '@angular/router';
import { MainComponent } from './sa_components/main/main.component';
import { NotFoundComponent } from './sa_components/not-found/not-found.component';
import { provideHttpClient } from '@angular/common/http';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./sa_components/main/form/home/home.component').then(
            (m) => m.HomeComponent
          ),
        title: 'Home Page',
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./sa_components/main/client/login/login.component').then(
            (m) => m.LoginComponent
          ),
        title: 'Login Page',
        providers: [provideHttpClient()]
      },
      {
        path: 'wish',
        loadComponent: () =>
          import('./sa_components/main/client/wish/wish.component').then(
            (m) => m.WishComponent
          ),
        title: 'Wish Page',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./sa_components/main/client/register/register.component').then(
            (m) => m.RegisterComponent
          ),
        title: 'Register Page',
      }
    ],
  },
  {
    path: 'admin',
    component: MainComponent,
    children: [
      {
        path: 'manage_stu',
        loadComponent: () =>
          import('./sa_components/main/admin/manage-stu/manage-stu.component').then(
            (m) => m.ManageStuComponent
          ),
        title: 'Manage Student Page',
      },
      {
        path: 'manage_tea',
        loadComponent: () =>
          import('./sa_components/main/admin/manage-tea/manage-tea.component').then(
            (m) => m.ManageTeaComponent
          ),
        title: 'Manage Teacher Page',
      },
    ],
  },
  {
    path: 'teacher',
    component: MainComponent,
    children: [],
  },
  {
    path: 'student',
    component: MainComponent,
    children: [],
  },
  { path: '**', component: NotFoundComponent, title: 'Not Found Page' },
];
