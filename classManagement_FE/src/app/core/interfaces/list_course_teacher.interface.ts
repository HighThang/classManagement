export interface Course {
  value: string;
  viewValue: string;
}

export interface CourseGroup {
  disabled?: boolean;
  name: string;
  course: Course[];
}

export interface TeacherGroup {
  value: string;
  viewValue: string;
}
