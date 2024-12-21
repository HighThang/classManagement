package ptit.d20.do_an.class_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ptit.d20.do_an.class_management.dto.SubjectDto;
import ptit.d20.do_an.class_management.dto.UserDetailDto;
import ptit.d20.do_an.class_management.service.SubjectService;
import ptit.d20.do_an.class_management.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserService userService;
    private final SubjectService subjectService;

    @Autowired
    public AdminController(UserService userService, SubjectService subjectService) {
        this.userService = userService;
        this.subjectService = subjectService;
    }

    // teachers
    @GetMapping("/teachers")
    public ResponseEntity<List<UserDetailDto>> getTeachersByStatus(
            @RequestParam boolean active,
            @RequestParam boolean deleted) {
        List<UserDetailDto> teachers = userService.getTeacherByActiveAndDeleted(active, deleted);
        if (teachers.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(teachers);
        }
        return ResponseEntity.ok(teachers);
    }

    @PutMapping("/activate-teacher/{teacherId}")
    public ResponseEntity<String> activateTeacher(@PathVariable Long teacherId) {
        boolean isActivated = userService.activateTeacherAccount(teacherId);
        if (isActivated) {
            return ResponseEntity.ok("Teacher account activated successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to activate teacher account.");
        }
    }

    @DeleteMapping("/delete-teacher/{teacherId}")
    public ResponseEntity<String> deleteTeacherAccount(@PathVariable Long teacherId) {
        String result = userService.deleteTeacherAccount(teacherId);
        if (result.equals("Deleted")) {
            return ResponseEntity.ok("Teacher account marked as deleted.");
        } else if (result.equals("Deactivated")) {
            return ResponseEntity.ok("Teacher account deactivated.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Teacher account not found or invalid role.");
        }
    }

    // students
    @GetMapping("/students")
    public ResponseEntity<List<UserDetailDto>> getStudentsByStatus(
            @RequestParam boolean active,
            @RequestParam boolean deleted) {
        List<UserDetailDto> students = userService.getStudentByActiveAndDeleted(active, deleted);
        if (students.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(students);
        }
        return ResponseEntity.ok(students);
    }

    @PutMapping("/activate-student/{studentId}")
    public ResponseEntity<String> activateStudent(@PathVariable Long studentId) {
        boolean isActivated = userService.activateStudent(studentId);
        if (isActivated) {
            return ResponseEntity.ok("Student account activated successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to activate student account.");
        }
    }

    @PutMapping("/disable-student/{studentId}")
    public ResponseEntity<String> disableStudent(@PathVariable Long studentId) {
        boolean isDisabled = userService.disableStudent(studentId);
        if (isDisabled) {
            return ResponseEntity.ok("Student account disabled successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to disable student account.");
        }
    }

    // subjects
    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectDto>> getSubjectsByActiveAndDeleted(
            @RequestParam boolean active,
            @RequestParam boolean deleted) {
        List<SubjectDto> subjects = subjectService.getSubjectsByActiveAndDeleted(active, deleted);
        return ResponseEntity.ok(subjects);
    }

    @PutMapping("/subjects/{id}/activate")
    public ResponseEntity<String> activateSubject(@PathVariable Integer id) {
        boolean isActivated = subjectService.activateSubject(id);
        if (isActivated) {
            return ResponseEntity.ok("Subject activated successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Subject not found.");
        }
    }

    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<String> deleteSubject(@PathVariable Integer id) {
        boolean isDeleted = subjectService.deleteSubject(id);
        if (isDeleted) {
            return ResponseEntity.ok("Subject deleted successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Subject not found or cannot be deleted.");
        }
    }
}