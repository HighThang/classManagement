package ptit.d20.do_an.class_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ptit.d20.do_an.class_management.dto.ExamScoreDto;
import ptit.d20.do_an.class_management.dto.NewExamRequest;
import ptit.d20.do_an.class_management.service.ExamScoreService;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/exam-score")
public class ExamScoreController {
    private final ExamScoreService examScoreService;

    @Autowired
    public ExamScoreController(ExamScoreService examScoreService) {
        this.examScoreService = examScoreService;
    }

    @GetMapping("/{classId}/exam")
    public Page<?> fetchAllExam(@PathVariable Long classId) {
        return examScoreService.fetchAllExam(classId);
    }

    @PostMapping
    public ResponseEntity<?> createExam(@Valid @RequestBody NewExamRequest request) {
        return ResponseEntity.ok(examScoreService.createNewExam(request));
    }

    @GetMapping("/{examId}")
    public Page<?> fetchAllExamScore(@PathVariable Long examId) {
        return examScoreService.fetchAllExamScore(examId);
    }

    @PutMapping
    public ResponseEntity<?> saveExamResult(@RequestBody List<ExamScoreDto> examScoreDtos) {
        return ResponseEntity.ok(examScoreService.saveExamResult(examScoreDtos));
    }

    // view-for-student
    @GetMapping("/student-exam-result")
    public ResponseEntity<?> getStudentExamResult(@RequestParam Long classId) {
        return ResponseEntity.ok(examScoreService.getStudentExamResult(classId));
    }

    @GetMapping("/{classId}/result")
    public void downloadExamResult(HttpServletResponse response, @PathVariable Long classId) throws IOException {
        String filePath = examScoreService.extractExamResult(classId);
        File file = new File(filePath);

        if (!file.exists()) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        // Set the response headers for XLSX
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + file.getName() + "\"");
        response.setContentLength((int) file.length());

        // Stream the file content to the response
        try (FileInputStream fileIn = new FileInputStream(file);
             ServletOutputStream out = response.getOutputStream()) {

            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = fileIn.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
            out.flush();
        }
    }
}
