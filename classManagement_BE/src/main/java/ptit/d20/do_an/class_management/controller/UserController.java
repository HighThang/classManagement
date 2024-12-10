package ptit.d20.do_an.class_management.controller;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ptit.d20.do_an.class_management.dto.UserDetailDto;
import ptit.d20.do_an.class_management.service.UserService;

@RestController
@RequestMapping("/api/user")
@Log4j2
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getUserDetail() {
        return ResponseEntity.ok(userService.getUserInfo());
    }

    @PutMapping
    public ResponseEntity<?> getUserDetail(@RequestBody UserDetailDto userDetailDto) {
        return ResponseEntity.ok(userService.updateUserInfo(userDetailDto));
    }

    @PutMapping("/update-image")
    public Boolean imageToUser(@RequestParam("file") MultipartFile file) {
        return userService.updateImageToUser(file);
    }
}
