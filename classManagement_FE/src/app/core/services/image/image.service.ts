import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private imageBaseUrl = 'http://localhost:8081/image';

  constructor(private http: HttpClient) {}

  getImage(): Observable<Blob> {
    return this.http.get(this.imageBaseUrl, { responseType: 'blob' });
  }
}
