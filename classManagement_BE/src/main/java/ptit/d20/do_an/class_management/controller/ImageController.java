package ptit.d20.do_an.class_management.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ptit.d20.do_an.class_management.domain.ClassSchedule;
import ptit.d20.do_an.class_management.domain.User;
import ptit.d20.do_an.class_management.service.ClassScheduleService;
import ptit.d20.do_an.class_management.service.UserService;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/image")
public class ImageController {
    private final UserService userService;
    private final ClassScheduleService classScheduleService;

    public ImageController(UserService userService, ClassScheduleService classScheduleService) {
        this.userService = userService;
        this.classScheduleService = classScheduleService;
    }

    @GetMapping
    public ResponseEntity<Resource> getImage() {
        User user = userService.getCurrentUserLogin();

        Path filePath = Paths.get(user.getImageURL());
        Resource resource = null;
        try {
            resource = new UrlResource(filePath.toUri());
        } catch (MalformedURLException e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }

        if (resource.exists() || resource.isReadable()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/image-attendance")
    public ResponseEntity<Resource> getImageAttendance(Long scheduleId) {
        ClassSchedule classSchedule = classScheduleService.getClassScheduleById(scheduleId);

        Path filePath = Paths.get(classSchedule.getImageClassAttendance());
        Resource resource = null;
        try {
            resource = new UrlResource(filePath.toUri());
        } catch (MalformedURLException e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }

        if (resource.exists() || resource.isReadable()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
