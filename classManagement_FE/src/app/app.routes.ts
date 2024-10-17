import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./components/dashboard/home/home/home.component').then(
            (m) => m.HomeComponent
          ),
        title: 'Home Page',
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./components/dashboard/client/login/login.component').then(
            (m) => m.LoginComponent
          ),
        title: 'Login Page',
      },
      {
        path: 'wish',
        loadComponent: () =>
          import('./components/dashboard/client/wish/wish.component').then(
            (m) => m.WishComponent
          ),
        title: 'Wish Page',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./components/dashboard/client/register/register.component').then(
            (m) => m.RegisterComponent
          ),
        title: 'Register Page',
      }
    ],
  },
  {
    path: 'admin',
    component: DashboardComponent,
    children: [],
  },
  {
    path: 'teacher',
    component: DashboardComponent,
    children: [],
  },
  {
    path: 'student',
    component: DashboardComponent,
    children: [],
  },
  { path: '**', component: NotFoundComponent, title: 'Not Found Page' },
];
