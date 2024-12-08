import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MAT_DATE_LOCALE, MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { SharedModule } from '../../../../shared/shared.module';
import { CommonModule, DatePipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { ChangeDetectionStrategy } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import Swal from 'sweetalert2';
import { ClientService } from '../../../../core/services/client/client.service';

@Component({
  selector: 'app-stu-course',
  standalone: true,
  imports: [MatIconModule, MatToolbarModule, CommonModule, MatStepperModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatOptionModule, MatSelectModule, SharedModule, MatDatepickerModule],
  providers: [provideNativeDateAdapter(), {provide: MAT_DATE_LOCALE, useValue: 'vi-VN'}, DatePipe],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './stu-course.component.html',
  styleUrl: './stu-course.component.scss'
})

export class StuCourseComponent implements OnInit {
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  
  subjects: string[] = [];
  teachers: string[] = [];
  selectedImage: string | ArrayBuffer | null = null;

  fileToUpload: File | null = null;
  fileStore: FileList | null = null;

  constructor(private _formBuilder: FormBuilder, private clientService: ClientService) {
    this.secondFormGroup = this._formBuilder.group({
      subjects: ['', Validators.required],
    });

    this.thirdFormGroup = this._formBuilder.group({
      teachers: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadSubjects();
    this.onCourseChange();
  }

  loadSubjects(): void {
    this.clientService.getAvailableSubjects().subscribe((data) => {
      this.subjects = data;
    });
  }

  onCourseChange(): void {
    this.secondFormGroup.get('subjects')?.valueChanges.subscribe((subjectName) => {
      if (subjectName) {
        this.clientService.getTeachersBySubject(subjectName).subscribe((data) => {
          this.teachers = data;
        });
      } else {
        this.teachers = [];
      }
    });
  }

  submitRegistration(): void {
    if (this.secondFormGroup.valid) {
      const requestDto = {
        subName: this.secondFormGroup.get('subjects')?.value,
        idClassroom: this.extractClassId(this.thirdFormGroup.get('teachers')?.value) 
      };
    }
  }
  
  extractClassId(classroomName: string | undefined): number | null { 
    if (classroomName) {
      const parts = classroomName.split(' - '); 
      return parts.length > 0 ? Number(parts[0]) : null;
    }
    return null;
  }
}