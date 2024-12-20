import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = 'http://localhost:8081/api/dashboard/all-class-schedule';

  constructor(private http: HttpClient) {}

  getAllClass(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
