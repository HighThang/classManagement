package ptit.d20.do_an.class_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ptit.d20.do_an.class_management.dto.RequestRegistrationDto;
import ptit.d20.do_an.class_management.service.ClassroomService;
import ptit.d20.do_an.class_management.service.SubjectService;

import java.util.List;

@RestController
@RequestMapping("/api/client")
public class ClientController {
    private final SubjectService subjectService;
    private final ClassroomService classroomService;

    @Autowired
    public ClientController(SubjectService subjectService, ClassroomService classroomService) {
        this.subjectService = subjectService;
        this.classroomService = classroomService;
    }

    @GetMapping("/available-subject")
    public ResponseEntity<List<String>> getAvailableSubjects() {
        List<String> activeSubjects = classroomService.getAvailableSubjects();
        return ResponseEntity.ok(activeSubjects);
    }

    @GetMapping("/available-teacher")
    public ResponseEntity<List<String>> getAvailableTeachers(String subjectName) {
        List<String> availableTeachers = classroomService.getAvailableTeachers(subjectName);
        return ResponseEntity.ok(availableTeachers);
    }

    @PostMapping("/request-to-class")
    public Long requestToClass(@RequestBody RequestRegistrationDto requestRegistrationDto) {
        return classroomService.createRequestToClass(requestRegistrationDto);
    }

    @PutMapping("/image-to-class/{id}")
    public Boolean imageToClass(@PathVariable("id") Long id, @RequestParam("file") MultipartFile file) {
        return classroomService.updateImageToClass(id, file);
    }
}
