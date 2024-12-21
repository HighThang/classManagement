package ptit.d20.do_an.class_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ptit.d20.do_an.class_management.dto.TutorFeeDetailDto;
import ptit.d20.do_an.class_management.service.TutorFeeService;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tutor-fee")
public class TutorFeeController {
    private final TutorFeeService tutorFeeService;

    @Autowired
    public TutorFeeController(TutorFeeService tutorFeeService) {
        this.tutorFeeService = tutorFeeService;
    }

    // get-all-fee
    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam Long classroomId) {
        return ResponseEntity.ok(tutorFeeService.searchByClassroomId(classroomId));
    }

    @GetMapping
    public ResponseEntity<?> getTutorFeeDetailsByTutorFeeId(@RequestParam Long tutorFeeId) {
        List<TutorFeeDetailDto> tutorFeeDetails = tutorFeeService.getTutorFeeDetailsByTutorFeeId(tutorFeeId);
        return ResponseEntity.ok(tutorFeeDetails);
    }

    @GetMapping("/calculate")
    public ResponseEntity<?> calculate(
            @RequestParam Long classId,
            @RequestParam Integer month,
            @RequestParam Integer year,
            @RequestParam Integer classSessionPrice) {
        return ResponseEntity.ok(tutorFeeService.calculateNewFee(classId, month, year, classSessionPrice));
    }

    @GetMapping("/re-calculate")
    public ResponseEntity<?> reCalculate(
            @RequestParam Long tutorFeeId,
            @RequestParam Integer classSessionPrice) {
        return ResponseEntity.ok(tutorFeeService.reCalculateFee(tutorFeeId, classSessionPrice));
    }

    @GetMapping("/{classId}/result")
    public void downloadFeeResult(HttpServletResponse response,
                                   @PathVariable Long classId,
                                   @RequestParam Integer month,
                                   @RequestParam Integer year,
                                   @RequestParam Integer classSessionPrice) throws IOException {
        String filePath = tutorFeeService.extractTutorFeeResult(classId, month, year, classSessionPrice);
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

    @GetMapping("/send-tutor-fee-notification")
    public ResponseEntity<?> sendTutorFeeNotification(@RequestParam Long classId, @RequestParam Integer month,
                                                      @RequestParam Integer year, @RequestParam Integer classSessionPrice) {
        return ResponseEntity.ok(tutorFeeService.sendTutorFeeNotificationEmail(classId, month, year, classSessionPrice));
    }

    @GetMapping("/student-not-submitted-tutor-fee")
    public ResponseEntity<?> getStudentNotSubmittedTutorFee(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(tutorFeeService.getStudentNotSubmittedTutorFee(params));
    }

    @PutMapping("/pay")
    public ResponseEntity<?> pay( @RequestParam Long tutorFeeDetailId) {
        return ResponseEntity.ok(tutorFeeService.pay(tutorFeeDetailId));
    }

    @GetMapping("/fee-for-student")
    public ResponseEntity<?> getTutorFeeForStudent(@RequestParam Long classId) {
        return ResponseEntity.ok(tutorFeeService.getTutorFeeForStudent(classId));
    }
}
