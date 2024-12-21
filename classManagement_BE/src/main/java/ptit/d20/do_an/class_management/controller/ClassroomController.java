package ptit.d20.do_an.class_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ptit.d20.do_an.class_management.dto.ClassroomStatusForStudentDto;
import ptit.d20.do_an.class_management.dto.ClassroomDto;
import ptit.d20.do_an.class_management.dto.NewClassRequest;
import ptit.d20.do_an.class_management.service.ClassroomService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classroom")
public class ClassroomController {
    private final ClassroomService classroomService;

    @Autowired
    public ClassroomController(ClassroomService classroomService) {
        this.classroomService = classroomService;
    }

    @GetMapping
    public ResponseEntity<?> getAllClassroomForUser() {
        return ResponseEntity.ok(classroomService.getClassroomForCurrentUser());
    }

    @PostMapping
    public ResponseEntity<?> createNewClass(@RequestBody NewClassRequest request) {
        return ResponseEntity.ok(classroomService.createNewClass(request));
    }

    // check-permission
    @GetMapping("/isTeachersClassroom")
    public ResponseEntity<Boolean> isTeachersClassroom(@RequestParam Long teacherId, Long id) {
        boolean exists = classroomService.isTeachersClassroom(teacherId, id);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/isStudentsClassroom")
    public ResponseEntity<Boolean> isStudentsClassroom(@RequestParam Long studentId, Long classroomId) {
        boolean exists = classroomService.isStudentsClassroom(studentId, classroomId);
        return ResponseEntity.ok(exists);
    }

    // class-details
    @GetMapping("/detail")
    public ResponseEntity<?> getClassDetail(@RequestParam Long classId) {
        return ResponseEntity.ok(classroomService.getClassDetail(classId));
    }

    @PutMapping
    public ResponseEntity<?> updateClassDetail(@RequestBody ClassroomDto classroomDto) {
        return ResponseEntity.ok(classroomService.updateClassDetail(classroomDto));
    }

    // view-for-student
    @GetMapping("/class-for-student")
    public ResponseEntity<?> searchClassForStudent(@RequestParam Map<String, String> params) {
        List<ClassroomStatusForStudentDto> classroomStatusList = classroomService.searchClassForStudent(params);
        return ResponseEntity.ok(classroomStatusList);
    }
}
