import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardResponse } from '../../interfaces/response.interface';

const default_url = ['http://localhost:8081/api/'];

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private dashboardApiUrl = default_url + 'dashboard';

  constructor(private http: HttpClient) {}

  getClassInWeek(): Observable<any> {
    return this.http.get(this.dashboardApiUrl + '/class-in-week');
  }

  getDashboardData(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.dashboardApiUrl + '/dashboard-data');
  }
}
