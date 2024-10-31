import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, tap, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthResponse } from '../../interfaces/auth_response.interface';

const default_url = ['http://localhost:8081/api/'];

@Injectable()
export class AuthService {
  private loginUrl = default_url + 'auth/login';
  private loginUserInformations = default_url + 'user';

  constructor(private http: HttpClient, private router: Router) {}

  authenticate(username: string, password: string): Observable<AuthResponse> {
    const data = {
      username,
      password
    };

    return this.http.post<AuthResponse>(this.loginUrl, data).pipe(
      tap(response => this.setToken(response.accessToken)),
      catchError(error => {
        this.showLoginFailedDialog();
        return throwError(error);
      })
    );
  }

  setToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  isLoggedIn() {        
    return localStorage.getItem('accessToken') !== null;
  }
  
  logout() {
    localStorage.removeItem('accessToken');
    this.router.navigate(['/login']);
  }

  showLoginFailedDialog(): void {
    Swal.fire({
      icon: "error",
      title: "Login failed!",
      text: "Invalid user name or password"
    });
  }

  getCurrentLoginInfor() {
    return this.http.get<Response>(this.loginUserInformations);
  }
}
