import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Teacher {
  id: number;
  username: string;
  email: string;
  phone: number;
  firstName: string;
  surname: string;
  lastName: string;
  dob: string;
}

export interface Student {
  id: number;
  email: string;
  phone: number;
  firstName: string;
  surname: string;
  lastName: string;
  dob: string;
}

export interface Subject {
  id: number;
  subName: string;
  teacherName: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private baseUrl = 'http://localhost:8081/api/admin';

  constructor(private http: HttpClient) {}

  // Teachers
  getPendingTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${this.baseUrl}/teachers?active=false&deleted=false`);
  }

  getActiveTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${this.baseUrl}/teachers?active=true&deleted=false`);
  }

  getDisabledTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${this.baseUrl}/teachers?active=false&deleted=true`);
  }

  activateTeacher(teacherId: number): Observable<string> {
    return this.http.put(`${this.baseUrl}/activate-teacher/${teacherId}`, null, {
      responseType: 'text',
    });
  }

  deleteTeacher(teacherId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/delete-teacher/${teacherId}`, {
      responseType: 'text',
    });
  }

  // Students
  getActiveStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/students?active=true&deleted=false`);
  }

  getDisabledStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/students?active=false&deleted=true`);
  }

  activateStudent(studentId: number): Observable<string> {
    return this.http.put(`${this.baseUrl}/activate-student/${studentId}`, null, {
      responseType: 'text',
    });
  }

  disableStudent(studentId: number): Observable<string> {
    return this.http.put(`${this.baseUrl}/disable-student/${studentId}`, null, {
      responseType: 'text',
    });
  }
  // Subjects
  getPendingSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.baseUrl}/subjects?active=false&deleted=false`);
  }

  getActiveSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.baseUrl}/subjects?active=true&deleted=false`);
  }

  getDisabledSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.baseUrl}/subjects?active=false&deleted=true`);
  }

  activateSubject(subjectId: number): Observable<string> {
    return this.http.put(`${this.baseUrl}/subjects/${subjectId}/activate`, null, {
      responseType: 'text',
    });
  }

  deleteSubject(subjectId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/subjects/${subjectId}`, {
      responseType: 'text',
    });
  }
}
