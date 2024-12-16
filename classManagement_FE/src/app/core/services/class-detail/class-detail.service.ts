import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface ClassDetails {
  id: number;
  className: string;
  subjectName: string;
  createdDate: string;
  note: string;
  teacherName: string;
}

export interface ScheduleData {
  id: number;
  day: string;
  periodInDay: string; 
  dayInWeek: string; 
  createdDate: string; 
  imageClassAttendance: string;
}

export interface DocumentData {
  id: number,
  createdDate: string,
  documentName: string,
  documentLink: string
}

@Injectable({
  providedIn: 'root',
})
export class ClassDetailsService {
  private baseUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  getClassDetails(classId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/classroom/detail?classId=${classId}`);
  }

  checkPermission(teacherId: number, classId: number): Observable<boolean> {
    const url = `${this.baseUrl}/classroom/isTeachersClassroom?teacherId=${teacherId}&id=${classId}`;
    return this.http.get<boolean>(url);
  }

  checkPermissionForStudent(studentId: number, classId: number): Observable<boolean> {
    const url = `${this.baseUrl}/classroom/isStudentsClassroom?studentId=${studentId}&classroomId=${classId}`;
    return this.http.get<boolean>(url);
  }

  updateClassDetails(classDetails: ClassDetails): Observable<any> {
    return this.http.put(`http://localhost:8081/api/classroom`, classDetails);
  }

  getStudents(classId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/student?classId=${classId}`);
  }

  activateStudent(studentId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/student/active/${studentId}`, null, {
      responseType: 'text',
    });
  }

  deleteStudent(studentId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/student/delete/${studentId}`, null);
  }

  downloadStudentResults(classId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/student/${classId}/download`, {
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

  getSchedules(classId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/class-schedule?classId=${classId}`);
  }

  deleteSchdule(scheduleId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/class-schedule/delete/${scheduleId}`, null);
  }

  getDocuments(classId: number): Observable<any> {
    const params = new HttpParams().set('classId', classId.toString());
    return this.http.get(`${this.baseUrl}/document`, { params });
  }

  uploadDocumentPdf(classId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put(`${this.baseUrl}/document/${classId}`, formData);
  }

  deleteDocument(documentId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/document/delete/${documentId}`, {});
  }

  downloadDocument(documentId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/document/download/${documentId}`, {
      responseType: 'blob',
      observe: 'response',
    }).pipe(
      map((response) => {
        const contentDisposition = response.headers.get('content-disposition');
        const filename = this.extractFilename(contentDisposition);
        Object.assign(response.body as Blob, { name: filename });
        return response.body as Blob;
      })
    );
  }
}

