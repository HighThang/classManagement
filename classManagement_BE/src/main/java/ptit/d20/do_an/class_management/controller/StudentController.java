package ptit.d20.do_an.class_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ptit.d20.do_an.class_management.domain.ClassRegistration;
import ptit.d20.do_an.class_management.dto.StudentDto;
import ptit.d20.do_an.class_management.service.StudentService;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final StudentService studentService;

    @Autowired
    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam Map<String, String> params, Pageable pageable) {
        return ResponseEntity.ok( studentService.search(params, pageable));
    }

    @GetMapping
    public ResponseEntity<?> getAllStudentForClass(@RequestParam Long classId) {
        List<ClassRegistration> students = studentService.getAllStudentForClass(classId);
        return ResponseEntity.ok(new PageImpl<>(students));
    }

    @PostMapping("/{classId}")
    public ResponseEntity<?> addStudentForClass(@RequestBody StudentDto studentDto, @PathVariable Long classId) {
        return ResponseEntity.ok(studentService.addStudentForClass(studentDto, classId));
    }

    @GetMapping("/{classId}/download")
    public void downloadListStudent(HttpServletResponse response, @PathVariable Long classId) throws IOException {
        String filePath = studentService.extractListStudent(classId);
        File file = new File(filePath);

        // Check if the file exists
        if (!file.exists()) {
            // If the file doesn't exist, return a 404 error response
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

    @PutMapping("/delete/{studentId}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentService.deleteStudent(studentId));
    }

    @PutMapping
    public ResponseEntity<?> updateStudent(@RequestBody StudentDto studentDto) {
        return ResponseEntity.ok(studentService.updateStudent(studentDto));
    }

    @PutMapping("/active/{studentId}")
    public ResponseEntity<?> activeStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentService.activeStudent(studentId));
    }

    @GetMapping("/isExistingRequestInWishList")
    public ResponseEntity<Boolean> isExistingRequestInWishList(@RequestParam Long studentId, Long classroomId) {
        boolean exists = studentService.isExistingRequestInWishList(studentId, classroomId);
        return ResponseEntity.ok(exists);
    }
}

