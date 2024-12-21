import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

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

  uploadImageForAttend(formData: FormData, scheduleId: number): Observable<boolean> {
    const url = `http://localhost:8081/api/class-schedule/upload-image-for-attend?scheduleId=${scheduleId}`;
    return this.http.put<boolean>(url, formData);
  }

  downloadAttendanceResults(classId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${classId}/result`, {
      responseType: 'blob',
      observe: 'response',
    }).pipe(
      map((response) => {
        const contentDisposition = response.headers.get('content-disposition');
        const filename = this.extractFilename(contentDisposition) || 'downloaded_file.xlsx';
        Object.assign(response.body as Blob, { name: filename });
        return response.body as Blob;
      })
    );
  }

  private extractFilename(contentDisposition: string | null): string | null {
    if (!contentDisposition) return null;
  
    const parts = contentDisposition.split(';');
    for (let part of parts) {
      if (part.trim().startsWith('filename=')) {
        let filename = part.split('=')[1].trim();
        return decodeURIComponent(filename.replace(/['"]/g, ''));
      }
    }
    return null;
  }

  getClassAttendanceForStudent(classId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/student-attendance-result?classId=${classId}`);
  }
}