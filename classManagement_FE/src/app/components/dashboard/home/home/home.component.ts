import { Component } from '@angular/core';
import { ButtonComponent } from "../../../../shared/components/button/button.component";
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ButtonComponent, MatTabsModule, MatGridListModule, MatIconModule, MatButtonModule, MatTabsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  teacherImages = ['/ani_pic(7).jpg'];
  studentImages = ['/ani_pic(7).jpg'];

  teacherImageIndex: number = 0;
  studentImageIndex: number = 0;

  currentTeacherImage: string = this.teacherImages[this.teacherImageIndex];
  currentStudentImage: string = this.studentImages[this.studentImageIndex];

  isTeacherTab: boolean = true;

  showTeacherImages() {
    this.isTeacherTab = true;
    this.currentTeacherImage = this.teacherImages[this.teacherImageIndex];
  }

  showStudentImages() {
    this.isTeacherTab = false;
    this.currentStudentImage = this.studentImages[this.studentImageIndex];
  }

  prevImage() {
    if (this.isTeacherTab) {
      this.teacherImageIndex = (this.teacherImageIndex === 0) ? this.teacherImages.length - 1 : this.teacherImageIndex - 1;
      this.currentTeacherImage = this.teacherImages[this.teacherImageIndex];
    } else {
      this.studentImageIndex = (this.studentImageIndex === 0) ? this.studentImages.length - 1 : this.studentImageIndex - 1;
      this.currentStudentImage = this.studentImages[this.studentImageIndex];
    }
  }

  nextImage() {
    if (this.isTeacherTab) {
      this.teacherImageIndex = (this.teacherImageIndex === this.teacherImages.length - 1) ? 0 : this.teacherImageIndex + 1;
      this.currentTeacherImage = this.teacherImages[this.teacherImageIndex];
    } else {
      this.studentImageIndex = (this.studentImageIndex === this.studentImages.length - 1) ? 0 : this.studentImageIndex + 1;
      this.currentStudentImage = this.studentImages[this.studentImageIndex];
    }
  }
}