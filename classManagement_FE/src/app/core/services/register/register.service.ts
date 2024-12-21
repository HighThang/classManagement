import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiUrl = 'http://localhost:8081/api/auth';

  constructor(private http: HttpClient) {}

  sendCode(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-code?email=${encodeURIComponent(email)}`, {});
  }

  verifyCode(email: string, code: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/verify-code?email=${encodeURIComponent(email)}&code=${code}`);
  }

  createAccount(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, formData);
  }
}