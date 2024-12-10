import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly apiUrl = 'http://localhost:8081/api/client';

  constructor(private http: HttpClient) {}

  getAvailableSubjects(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/available-subject`);
  }

  getTeachersBySubject(subjectName: string): Observable<string[]> {
    const url = `${this.apiUrl}/available-teacher?subjectName=${encodeURIComponent(subjectName)}`;
    return this.http.get<string[]>(url);
  }

  requestToClass(requestRegistrationDto: any): Observable<number> {
    const url = `${this.apiUrl}/request-to-class`;
    return this.http.post<number>(url, requestRegistrationDto);
  }

  uploadImageToClass(id: number, formData: FormData): Observable<boolean> {
    const url = `${this.apiUrl}/image-to-class/${id}`;
    return this.http.put<boolean>(url, formData);
  }
}
