import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, Subject, tap, throwError } from 'rxjs';
import { AuthResponse, UserResponse } from '../../interfaces/response.interface';
import Swal from 'sweetalert2';

const default_url = ['http://localhost:8081/api/'];

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loginUrl = default_url + 'auth/login';
  private loginUserInformations = default_url + 'user';
  private userUpdated = new Subject<UserResponse>();

  userUpdated$ = this.userUpdated.asObservable();
  
  constructor(private http: HttpClient, private router: Router) {}

  authenticate(username: string, password: string): Observable<AuthResponse> {
    const data = {
      username,
      password,
    };

    return this.http.post<AuthResponse>(this.loginUrl, data).pipe(
      tap((response) => this.setToken(response.accessToken)),
      catchError((error) => {
        this.showLoginFailedDialog();
        return throwError(error);
      })
    );
  }

  setToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  hasToken() {
    return localStorage.getItem('accessToken') !== null;
  }

  logout() {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  showLoginFailedDialog(): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
    Toast.fire({
      icon: 'error',
      title: 'Email hoặc mật khẩu không chính xác',
    });
  }

  setCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(this.loginUserInformations).pipe(
      tap((res) => {
        sessionStorage.setItem('currentUser', JSON.stringify(res));
        this.userUpdated.next(res);
      })
    );
  }  

  updateUser(user: UserResponse) {
    this.userUpdated.next(user);
  }

  getCurrentUser() {
    const currentUser = sessionStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
  }

  getUserRole() {
    const user = this.getCurrentUser();
    if (user === null) return '';
    return user.role;
  }

  isAdminLoggedIn() {
    const role = this.getUserRole();
    return role === 'ADMIN';
  }

  isTeacherLoggedIn() {
    const role = this.getUserRole();
    return role === 'TEACHER';
  }

  isStudentLoggedIn() {
    const role = this.getUserRole();
    return role === 'STUDENT';
  }
}
