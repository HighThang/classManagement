import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Classroom {
  id?: number;
  className: string;
  subjectName: string;
  note: string;
  createdDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClassroomService {
  private readonly apiUrl = 'http://localhost:8081/api/classroom';

  constructor(private httpClient: HttpClient) {}

  getClassrooms(): Observable<Classroom[]> {
    return this.httpClient.get<Classroom[]>(this.apiUrl);
  }

  createClassroom(classroom: Classroom): Observable<any> {
    return this.httpClient.post(this.apiUrl, classroom);
  }

  getClassroomsForStudent(params: any): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/class-for-student`, { params });
  }
}
