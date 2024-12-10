import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Attendance {
  id: number;
  name: string;
  email: string;
  dob: string | null;
  isAttended: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ClassAttendanceService {
  private readonly apiUrl = 'http://localhost:8081/api/class-attendance';

  constructor(private http: HttpClient) {}

  getClassAttendance(classId: number): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/${classId}`);
  }

  updateAttendance(data: any): Observable<any> {
    return this.http.put(this.apiUrl, data);
  }
}