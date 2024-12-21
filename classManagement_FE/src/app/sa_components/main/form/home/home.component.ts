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
  teacherImages = ['/gv1.png', '/gv2.png', '/gv3.png', '/gv4.png', '/gv5.png', '/gv6.png', '/gv7.png'];
  studentImages = ['/hs1.png', '/hs2.png', '/hs3.png', '/hs4.png', '/hs5.png', '/hs6.png'];

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

  onTabChange(event: any) {
    if (event.index === 0) {
      this.showTeacherImages();
    } else if (event.index === 1) {
      this.showStudentImages();
    }
  }
}