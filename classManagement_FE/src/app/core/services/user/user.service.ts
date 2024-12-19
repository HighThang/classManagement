import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

export interface UserResponse {
  email: string, 
  role: string,
  dob: string,
  firstName: string,
  surname: string,
  lastName: string,
  phone: string,
  business: string,
  address: string,
  imageURL: string
}

const default_url = ['http://localhost:8081/api/'];

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userApiUrl = default_url + 'user';

  constructor(private http: HttpClient) {}

  getUserInfo(): Observable<UserResponse> {
    return this.http.get<UserResponse>(this.userApiUrl);
  }

  updateUserInfo(user: UserResponse): Observable<UserResponse> {
    return this.http.put<UserResponse>(this.userApiUrl, user).pipe(
      tap((res) => {
        sessionStorage.setItem('currentUser', JSON.stringify(res));
      })
    );
  }

  uploadImageToUser(formData: FormData): Observable<boolean> {
    const url = `${this.userApiUrl}/update-image`;
    return this.http.put<boolean>(url, formData);
  }
}
