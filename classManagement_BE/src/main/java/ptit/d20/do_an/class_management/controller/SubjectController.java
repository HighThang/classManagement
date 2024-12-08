package ptit.d20.do_an.class_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ptit.d20.do_an.class_management.domain.Subject;
import ptit.d20.do_an.class_management.dto.SubjectDto;
import ptit.d20.do_an.class_management.service.SubjectService;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {
    private final SubjectService subjectService;

    @Autowired
    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @PostMapping
    public ResponseEntity<String> createSubject(
            @RequestParam String subName,
            @RequestParam Long idTeacher
    ) {
        Subject createdSubject = subjectService.createSubject(subName, idTeacher);
        return ResponseEntity.status(HttpStatus.CREATED).body("Subject created successfully with ID: " + createdSubject.getId());
    }

    // API lấy danh sách môn học active = 1, deleted = 0
    @GetMapping("/active")
    public ResponseEntity<List<SubjectDto>> getActiveSubjects() {
        List<SubjectDto> activeSubjects = subjectService.getActiveSubjects();
        return ResponseEntity.ok(activeSubjects);
    }
}

