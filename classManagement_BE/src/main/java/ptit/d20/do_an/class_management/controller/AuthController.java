package ptit.d20.do_an.class_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ptit.d20.do_an.class_management.dto.ApiResponse;
import ptit.d20.do_an.class_management.dto.ResetPasswordRequest;
import ptit.d20.do_an.class_management.dto.security.JwtAuthenticationResponse;
import ptit.d20.do_an.class_management.dto.security.LoginRequest;
import ptit.d20.do_an.class_management.dto.security.SignUpRequest;
import ptit.d20.do_an.class_management.security.JwtTokenProvider;
import ptit.d20.do_an.class_management.service.UserService;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    @Autowired
    public AuthController(
            AuthenticationManager authenticationManager,
            JwtTokenProvider jwtTokenProvider,
            UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
    }

    // login
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),
                loginRequest.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtTokenProvider.generateToken(authentication);
        return ResponseEntity.ok(new JwtAuthenticationResponse(jwt));
    }

    // signup
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        userService.createNewUser(signUpRequest);
        return ResponseEntity.ok(new ApiResponse(true, "Account created successfully."));
    }

    @PostMapping("/send-code")
    public ResponseEntity<?> sendEmailCode(String email) {
        return ResponseEntity.ok(userService.sendEmailCode(email));
    }

    @GetMapping("/verify-code")
    public ResponseEntity<?> verifyEmailToCreateAccount(String email, String code) {
        return ResponseEntity.ok(userService.verifyEmailToCreateAccount(email, code));
    }

    // forget-pass
    @GetMapping("/send-mail-forgot-password")
    public ResponseEntity<?> sendMailForgotPassword(@RequestParam String email) {
        return ResponseEntity.ok(userService.sendMailForgotPassword(email));
    }

    @PutMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(userService.resetPassword(request));
    }

    // check-existed-email
    @GetMapping("/isExistingEmail")
    public ResponseEntity<Boolean> isExistingEmail(@RequestParam String email) {
        boolean exists = userService.isEmailExisting(email);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/isExistingEmailInWishList")
    public ResponseEntity<Boolean> isExistingEmailInWishList(@RequestParam String email) {
        boolean exists = userService.isExistingEmailInWishList(email);
        return ResponseEntity.ok(exists);
    }

    // check-existed-req
    @GetMapping("/isExistingRequestInWishList")
    public ResponseEntity<Boolean> isExistingRequestInWishList(@RequestParam String email, Long classroomId) {
        boolean exists = userService.isExistingRequestInWishList(email, classroomId);
        return ResponseEntity.ok(exists);
    }
}
