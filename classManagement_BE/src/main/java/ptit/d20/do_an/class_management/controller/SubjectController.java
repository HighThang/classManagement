package ptit.d20.do_an.class_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ptit.d20.do_an.class_management.domain.Subject;
import ptit.d20.do_an.class_management.dto.SubjectDto;
import ptit.d20.do_an.class_management.service.SubjectService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @GetMapping("/active")
    public ResponseEntity<List<SubjectDto>> getActiveSubjects() {
        List<SubjectDto> activeSubjects = subjectService.getActiveSubjects();
        return ResponseEntity.ok(activeSubjects);
    }

    @GetMapping("/check-exists-subject")
    public ResponseEntity<Map<String, Object>> checkSubjectExists(@RequestParam String subName) {
        boolean exists = subjectService.checkSubjectExists(subName);
        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }
}

