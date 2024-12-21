package ptit.d20.do_an.class_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ptit.d20.do_an.class_management.domain.ClassSchedule;
import ptit.d20.do_an.class_management.dto.ApiResponse;
import ptit.d20.do_an.class_management.dto.NewClassScheduleRequest;
import ptit.d20.do_an.class_management.service.ClassScheduleService;

import java.util.List;

@RestController
@RequestMapping("/api/class-schedule")
public class ClassScheduleController {
    private final ClassScheduleService classScheduleService;

    @Autowired
    public ClassScheduleController(ClassScheduleService classScheduleService) {
        this.classScheduleService = classScheduleService;
    }

    @GetMapping
    public ResponseEntity<?> getAllClassSchedule(@RequestParam Long classId) throws Exception {
        List<ClassSchedule> students = classScheduleService.getAllClassSchedule(classId);
        return ResponseEntity.ok(new PageImpl<>(students));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createClassSchedule(@RequestBody NewClassScheduleRequest request) {
        return ResponseEntity.ok(classScheduleService.createClassSchedule(request));
    }

    @PutMapping("/delete/{scheduleId}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long scheduleId) {
        return ResponseEntity.ok(classScheduleService.deleteSchedule(scheduleId));
    }

    @PutMapping("/upload-image-for-attend")
    public Boolean uploadImageToAttend(@RequestParam("file") MultipartFile file, Long scheduleId) {
        return classScheduleService.uploadImageToAttend(file, scheduleId);
    }
}
