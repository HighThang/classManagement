import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface Exam {
  id: number;
  examName: string;
  createdDate: string;
}

export interface ScoreDetail {
  id: number;
  name: string;
  email: string;
  score: number;
}

@Injectable({
  providedIn: 'root',
})
export class ExamScoreService {
  private baseUrl = 'http://localhost:8081/api/exam-score';

  constructor(private http: HttpClient) {}

  getAllExams(classId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${classId}/exam`);
  }

  createExam(examName: string, classId: number): Observable<any> {
    const payload = { examName, classId };
    return this.http.post(this.baseUrl, payload);
  }

  downloadExamResults(classId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${classId}/result`, {
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
  
  getStudentsByExamId(examId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${examId}`);
  }

  editExamScores(data: any): Observable<any> {
    return this.http.put(this.baseUrl, data);
  }

  getAllExamsForStudent(classId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/student-exam-result?classId=${classId}`);
  }
}
