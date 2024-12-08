import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClassDetails {
  id: number;
  className: string;
  subjectName: string;
  createdDate: string;
  note: string;
}

export interface ScheduleData {
  id: number;
  day: string;
  periodInDay: string; 
  dayInWeek: string; 
  createdDate: string; 
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

  updateClassDetails(classDetails: ClassDetails): Observable<any> {
    return this.http.put(`http://localhost:8081/api/classroom`, classDetails);
  }

  getStudents(classId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/student?classId=${classId}`);
  }

  getSchedules(classId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/class-schedule?classId=${classId}`);
  }

  getDocuments(classId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/document?classId=${classId}`);
  }
}

