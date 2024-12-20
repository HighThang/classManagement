import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CheckJoinClassRequestService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  checkIfRequestExistsForStudent(studentId: number, classroomId: number): Promise<boolean> {
    const apiUrl = `${this.apiUrl}/student/isExistingRequestInWishList?studentId=${studentId}&classroomId=${classroomId}`;
    return this.http
      .get<boolean>(apiUrl).toPromise()
      .then((response) => response || false)
      .catch(() => false);
  }

  checkIfRequestExistsForClient(email: number, classroomId: number): Promise<boolean> {
    const apiUrl = `${this.apiUrl}/auth/isExistingRequestInWishList?email=${email}&classroomId=${classroomId}`;
    return this.http
      .get<boolean>(apiUrl).toPromise()
      .then((response) => response || false)
      .catch(() => false);
  }
}
