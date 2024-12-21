import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class ForgetPassService {
  private baseUrl = 'http://localhost:8081/api/auth';

  constructor(private http: HttpClient) {}

  sendForgotPasswordEmail(email: string): Observable<ApiResponse> {
    const url = `${this.baseUrl}/send-mail-forgot-password`;
    return this.http.get<ApiResponse>(url, { params: { email } });
  }

  resetPassword(data: ResetPasswordRequest): Observable<ApiResponse> {
    const url = `${this.baseUrl}/reset-password`;
    return this.http.put<ApiResponse>(url, data);
  }
}
