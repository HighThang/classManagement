import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface TutorFeeDto {
  id: number;
  createdDate: string;
  year: number;
  month: number;
  lessonPrice: number;
  totalLesson: number;
  feeEstimate: number;
  feeCollected: number;
  feeNotCollected: number;
}

export interface TutorFeeDetailDto {
  id: number;
  studentName: string;
  email: string;
  phone: string;
  totalNumberOfClasses: number;
  numberOfClassesAttended: number;
  feeAmount: number;
  feeSubmitted: number;
  feeNotSubmitted: number;
  month: number;
  year: number;
  lessionPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class FeeService {
  private readonly apiUrl = 'http://localhost:8081/api/tutor-fee'; 

  constructor(private http: HttpClient) {}

  getStudentNotSubmittedTutorFee(params: Record<string, string>): Observable<any[]> {
    let httpParams = new HttpParams();
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        httpParams = httpParams.set(key, params[key]);
      }
    }

    return this.http.get<any[]>(`${this.apiUrl}/student-not-submitted-tutor-fee`, { params: httpParams });
  }

  updateSubmiteedTutorFee(tutorFeeDetailId: number) {
    return this.http.put(`${this.apiUrl}/pay?tutorFeeDetailId=${tutorFeeDetailId}`, null);
  }

  searchTutorFees(classroomId: number): Observable<TutorFeeDto[]> {
    return this.http.get<TutorFeeDto[]>(`${this.apiUrl}/search`, {
      params: { classroomId: classroomId.toString() },
    });
  }  
  
  getTutorFeeDetailsByTutorFeeId(tutorFeeId: number): Observable<TutorFeeDetailDto[]> {
    return this.http.get<TutorFeeDetailDto[]>(`${this.apiUrl}?tutorFeeId=${tutorFeeId}`);
  }

  calculateNewFee(classId: number, month: number, year: number, classSessionPrice: number): Observable<any> {
    const params = {
      classId: classId.toString(),
      month: month.toString(),
      year: year.toString(),
      classSessionPrice: classSessionPrice.toString(),
    };
    return this.http.get(`${this.apiUrl}/calculate`, { params });
  }

  reCalculateFee(tutorFeeId: number, classSessionPrice: number): Observable<any> {
    const params = {
      tutorFeeId: tutorFeeId.toString(),
      classSessionPrice: classSessionPrice.toString(),
    };
    return this.http.get(`${this.apiUrl}/re-calculate`, { params });
  }

  sendTutorFeeNotification(classId: number, month: number, year: number, classSessionPrice: number): Observable<string> {
    const params = new HttpParams()
      .set('classId', classId)
      .set('month', month)
      .set('year', year)
      .set('classSessionPrice', classSessionPrice);

    return this.http.get<string>(`${this.apiUrl}/send-tutor-fee-notification`, { params, responseType: 'text' as 'json' });
  }

  downloadTutorFeeResults(classId: number, month: number, year: number, classSessionPrice: number): Observable<any> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString())
      .set('classSessionPrice', classSessionPrice.toString());

    const url = `${this.apiUrl}/${classId}/result`;

    return this.http.get(url, { params, responseType: 'blob' })
  }

  getTutorFeeForStudent(classId: number): Observable<TutorFeeDetailDto[]> {
    const params = { classId: classId.toString() };
    return this.http.get<TutorFeeDetailDto[]>(`${this.apiUrl}/fee-for-student`, { params });
  }
}
