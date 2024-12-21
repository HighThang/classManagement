package ptit.d20.do_an.class_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ptit.d20.do_an.class_management.domain.ClassRegistration;
import ptit.d20.do_an.class_management.service.StudentService;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/student")
public class StudentController {
    private final StudentService studentService;

    @Autowired
    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public ResponseEntity<?> getAllStudentForClass(@RequestParam Long classId) {
        List<ClassRegistration> students = studentService.getAllStudentForClass(classId);
        return ResponseEntity.ok(new PageImpl<>(students));
    }

    @GetMapping("/{classId}/download")
    public void downloadListStudent(HttpServletResponse response, @PathVariable Long classId) throws IOException {
        String filePath = studentService.extractListStudent(classId);
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

    @PutMapping("/active/{studentId}")
    public ResponseEntity<?> activeStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentService.activeStudent(studentId));
    }

    @PutMapping("/delete/{studentId}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentService.deleteStudent(studentId));
    }

    // check-student-req
    @GetMapping("/isExistingRequestInWishList")
    public ResponseEntity<Boolean> isExistingRequestInWishList(@RequestParam Long studentId, Long classroomId) {
        boolean exists = studentService.isExistingRequestInWishList(studentId, classroomId);
        return ResponseEntity.ok(exists);
    }
}

