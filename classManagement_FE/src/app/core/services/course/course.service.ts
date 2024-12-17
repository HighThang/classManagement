import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Course {
  id: number;
  subName: string;
  teacherName: string;
}

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private apiUrl = 'http://localhost:8081/api/subjects';

  constructor(private http: HttpClient) {}

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/active`);
  }

  addCourse(courseData: { subName: string; idTeacher: number }): Observable<string> {
    const url = `${this.apiUrl}?subName=${encodeURIComponent(courseData.subName)}&idTeacher=${courseData.idTeacher}`;
    return this.http.post(url, null, { responseType: 'text' });
  }

  checkSubjectExists(subName: string): Observable<{ exists: boolean }> {
    const params = new HttpParams().set('subName', subName);
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-exists-subject`, { params });
  }
}
