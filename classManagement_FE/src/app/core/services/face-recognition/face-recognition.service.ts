import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FaceRecognitionService {
  private baseUrl = 'http://localhost:5000'; 

  constructor(private http: HttpClient) {}

  recognizeFaces(scheduleId: number): Observable<any> {
    const url = `${this.baseUrl}/recognize_faces`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { scheduleId };

    return this.http.post<any>(url, body, { headers });
  }
}
