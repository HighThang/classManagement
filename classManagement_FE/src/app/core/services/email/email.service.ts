import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmailService implements AsyncValidator {
  private baseUrl1 = 'http://localhost:8081/api/auth/isExistingEmail';
  private baseUrl2 = 'http://localhost:8081/api/auth/isExistingEmailInWishList';

  constructor(private http: HttpClient) {}

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }

    return of(control.value).pipe(
      debounceTime(300),
      switchMap((email) => 
        this.http.get<boolean>(`${this.baseUrl1}?email=${encodeURIComponent(email)}`).pipe(
          map((isExisting) => (isExisting ? { emailExists: true } : null)),
          catchError(() => of(null))
        )
      )
    );
  }

  validateWishList(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }

    return of(control.value).pipe(
      debounceTime(300),
      switchMap((email) => 
        this.http.get<boolean>(`${this.baseUrl2}?email=${encodeURIComponent(email)}`).pipe(
          map((isExisting) => (isExisting ? { emailExists: true } : null)),
          catchError(() => of(null))
        )
      )
    );
  }
}
