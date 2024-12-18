package ptit.d20.do_an.class_management.service;

import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ptit.d20.do_an.class_management.domain.ClassRegistration;
import ptit.d20.do_an.class_management.domain.EmailCode;
import ptit.d20.do_an.class_management.domain.Role;
import ptit.d20.do_an.class_management.domain.User;
import ptit.d20.do_an.class_management.dto.ApiResponse;
import ptit.d20.do_an.class_management.dto.EmailDetail;
import ptit.d20.do_an.class_management.dto.ResetPasswordRequest;
import ptit.d20.do_an.class_management.dto.UserDetailDto;
import ptit.d20.do_an.class_management.dto.security.SignUpRequest;
import ptit.d20.do_an.class_management.exception.BadRequestException;
import ptit.d20.do_an.class_management.exception.BusinessException;
import ptit.d20.do_an.class_management.exception.ResourceNotFoundException;
import ptit.d20.do_an.class_management.repository.ClassRegistrationRepository;
import ptit.d20.do_an.class_management.repository.EmailCodeRepository;
import ptit.d20.do_an.class_management.repository.RoleRepository;
import ptit.d20.do_an.class_management.security.SecurityUtils;
import ptit.d20.do_an.class_management.service.email.EmailService;

import ptit.d20.do_an.class_management.enumeration.RoleName;
import ptit.d20.do_an.class_management.repository.UserRepository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Log4j2
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailCodeRepository emailCodeRepository;
    private final EmailService emailService;
    private final ClassRegistrationRepository classRegistrationRepository;
    private final String tempFolder;


    @Autowired
    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       EmailCodeRepository emailCodeRepository, EmailService emailService,
                       ClassRegistrationRepository classRegistrationRepository, @Value("${app.temp}") String tempFolder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailCodeRepository = emailCodeRepository;
        this.emailService = emailService;
        this.classRegistrationRepository = classRegistrationRepository;
        this.tempFolder = tempFolder;
    }

    public void createNewUser(SignUpRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            String errorMessage = String.format("Username %s already in use", signUpRequest.getUsername());
            throw new BadRequestException(errorMessage);
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            String errorMessage = String.format("Email %s already in use", signUpRequest.getEmail());
            throw new BadRequestException(errorMessage);
        }

        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        user.setUsername(signUpRequest.getUsername());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());
        user.setSurname(signUpRequest.getSurname());
        user.setDob(signUpRequest.getDob().toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate());
        user.setAddress(signUpRequest.getAddress());
        user.setPhone(signUpRequest.getPhone());
        user.setBusiness(signUpRequest.getBusiness());

        Optional<Role> userRole = roleRepository.findByName(RoleName.TEACHER);
        if (userRole.isEmpty()) {
            log.error("User Role not set.");
            throw new ResourceNotFoundException("Server Error");
        }
        user.setRole(userRole.get());

        user.setActive(false);
        user.setDeleted(false);
        user.setNumberActiveAttempt(0);
//        String activeCode = RandomStringUtils.randomAlphanumeric(6);
//        user.setActiveCode(activeCode);

//        sendEmailVerification(user);
        user = userRepository.save(user);
    }

    private void sendEmailVerification(User user) {
        EmailDetail emailDetail = new EmailDetail();
        if (StringUtils.isBlank(user.getEmail())) {
            throw new BusinessException("Can not send email verification for email empty!");
        }
        emailDetail.setSubject("Classroom verification");
        emailDetail.setMsgBody("Here is your active code: " + user.getActiveCode());
        emailDetail.setRecipient(user.getEmail());

        log.info("Sending email verification email for email {}", user.getEmail());
        emailService.sendSimpleEmail(emailDetail);
    }

    public void createDefaultStudentAccount(ClassRegistration student) {
        if (StringUtils.isNotBlank(student.getEmail())) {
            String randomPassword = RandomStringUtils.randomAlphanumeric(6);

            if (userRepository.existsByUsername(student.getEmail())) {
                throw new BadRequestException("Username " + student.getEmail() + " already in use");
            }

            if (userRepository.existsByEmail(student.getEmail())) {
                throw new BadRequestException("Email " + student.getEmail() + " already in use");
            }

            User user = new User();
            user.setEmail(student.getEmail());
            user.setUsername(student.getEmail());
            user.setPassword(passwordEncoder.encode(randomPassword));
            user.setFirstName(student.getFirstName());
            user.setSurname(student.getSurname());
            user.setLastName(student.getLastName());
            user.setPhone(student.getPhone());
            user.setAddress(student.getAddress());
            if (student.getDob() != null) {
                user.setDob(student.getDob().toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate());
            }

            Optional<Role> userRole = roleRepository.findByName(RoleName.STUDENT);
            if (userRole.isEmpty()) {
                log.error("User Role not set.");
                throw new BusinessException("Server Error: User role not found");
            }
            user.setRole(userRole.get());

            user.setActive(true);
            user.setDeleted(false);
            user = userRepository.save(user);

            String result =  copyClassRegistrationToUserPath(student.getImgURLRequest(), user.getId(), student.getId());
            user.setImageURL(result);
            user = userRepository.save(user);

//            user.setNumberActiveAttempt(0);
//            String activeCode = RandomStringUtils.randomAlphanumeric(6);
//            user.setActiveCode(activeCode);

            sendEmailVerification(user, randomPassword);
            student.setStudent(user);

            final User savedUser = user;
            List<ClassRegistration> registrationsToUpdate =
                    classRegistrationRepository.findAllByEmailAndStudentIsNull(student.getEmail());

            registrationsToUpdate.forEach(registration -> registration.setStudent(savedUser));
            classRegistrationRepository.saveAll(registrationsToUpdate);
        }
    }

    public static String copyClassRegistrationToUserPath(String originalPath, Long userId, Long registrationId) {
        try {
            // Replace "classRegistration" and registrationId with "User" and userId in the path
            String userPath = originalPath.replace(
                    "image/classRegistration/" + registrationId,
                    "image/User/" + userId
            );

            // Convert the paths to Path objects
            Path sourcePath = Paths.get(originalPath);
            Path targetPath = Paths.get(userPath);

            // Ensure the source file exists
            if (!Files.exists(sourcePath)) {
                System.err.println("Source file does not exist: " + sourcePath);
                return "";
            }

            // Create directories for the target file if they don't exist
            Path targetDirectory = targetPath.getParent();
            if (targetDirectory != null && !Files.exists(targetDirectory)) {
                Files.createDirectories(targetDirectory);
                System.out.println("Created target directory: " + targetDirectory);
            }

            // Copy the file
            Files.copy(sourcePath, targetPath);
            System.out.println("File copied successfully from " + sourcePath + " to " + targetPath);
            return targetPath.toString();

        } catch (IOException e) {
            System.err.println("Error while copying file: " + e.getMessage());
            e.printStackTrace();
        }
        return "";
    }

    private void sendEmailVerification(User user, String randomPassword) {
        EmailDetail emailDetail = new EmailDetail();
        if (StringUtils.isBlank(user.getEmail())) {
            throw new BusinessException("Cannot send email verification for empty email!");
        }
        emailDetail.setSubject("Xác thực tài khoản lớp học");
        emailDetail.setMsgBody("Đây là mật khẩu của bạn: " + randomPassword);
        emailDetail.setRecipient(user.getEmail());

        log.info("Sending email verification to email {}", user.getEmail());
        emailService.sendSimpleEmail(emailDetail);
    }

    public User getCurrentUserLogin() {
        String currentLogin = SecurityUtils.getCurrentUserLogin()
                .orElseThrow(() -> new BusinessException("Not found current user login"));

        return userRepository.findByUsername(currentLogin)
                .orElseThrow(() -> new BusinessException("Not found user with login " + currentLogin));
    }

    public UserDetailDto getUserInfo() {
        User user = getCurrentUserLogin();
        return new UserDetailDto(user);
    }

    private Date convertToDate(LocalDate localDate) {
        return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    public UserDetailDto updateUserInfo(UserDetailDto userDetailDto) {
        User user = getCurrentUserLogin();
        if (StringUtils.isNoneBlank(userDetailDto.getFirstName())) {
            user.setFirstName(userDetailDto.getFirstName());
            List<ClassRegistration> classRegistrations = classRegistrationRepository.findAllByEmail(user.getEmail());
            for (ClassRegistration classRegistration : classRegistrations) {
                classRegistration.setFirstName(userDetailDto.getFirstName());
            }
            classRegistrationRepository.saveAll(classRegistrations);
        }
        if (StringUtils.isNoneBlank(userDetailDto.getSurname())) {
            user.setSurname(userDetailDto.getSurname());
            List<ClassRegistration> classRegistrations = classRegistrationRepository.findAllByEmail(user.getEmail());
            for (ClassRegistration classRegistration : classRegistrations) {
                classRegistration.setSurname(userDetailDto.getSurname());
            }
            classRegistrationRepository.saveAll(classRegistrations);
        }
        if (StringUtils.isNoneBlank(userDetailDto.getLastName())) {
            user.setLastName(userDetailDto.getLastName());
            List<ClassRegistration> classRegistrations = classRegistrationRepository.findAllByEmail(user.getEmail());
            for (ClassRegistration classRegistration : classRegistrations) {
                classRegistration.setLastName(userDetailDto.getLastName());
            }
            classRegistrationRepository.saveAll(classRegistrations);
        }
        if (userDetailDto.getDob() != null) {
            user.setDob(userDetailDto.getDob());
            List<ClassRegistration> classRegistrations = classRegistrationRepository.findAllByEmail(user.getEmail());
            for (ClassRegistration classRegistration : classRegistrations) {
                classRegistration.setDob(convertToDate(userDetailDto.getDob()));
            }
            classRegistrationRepository.saveAll(classRegistrations);
        }
        if (StringUtils.isNoneBlank(userDetailDto.getPhone())) {
            user.setPhone(userDetailDto.getPhone());
            List<ClassRegistration> classRegistrations = classRegistrationRepository.findAllByEmail(user.getEmail());
            for (ClassRegistration classRegistration : classRegistrations) {
                classRegistration.setPhone(userDetailDto.getPhone());
            }
            classRegistrationRepository.saveAll(classRegistrations);
        }
        if (StringUtils.isNoneBlank(userDetailDto.getBusiness())) {
            user.setBusiness(userDetailDto.getBusiness());
        }
        if (StringUtils.isNoneBlank(userDetailDto.getAddress())) {
            user.setAddress(userDetailDto.getAddress());
            List<ClassRegistration> classRegistrations = classRegistrationRepository.findAllByEmail(user.getEmail());
            for (ClassRegistration classRegistration : classRegistrations) {
                classRegistration.setAddress(userDetailDto.getAddress());
            }
            classRegistrationRepository.saveAll(classRegistrations);
        }
        userRepository.save(user);

        log.info("Updated info for user with login {}", user.getUsername());
        return new UserDetailDto(user);
    }

    public Boolean updateImageToUser(MultipartFile file) {
        User user = getCurrentUserLogin();

        // Tạo thư mục tạm thời nếu chưa tồn tại
        File tempFolder = new File(this.tempFolder + "/document");
        if (!tempFolder.exists()) {
            tempFolder.mkdirs();
        }

        // Tạo file tạm thời
        File tempFile = new File(tempFolder, file.getOriginalFilename());
        try {
            // Lưu file vào thư mục tạm
            file.transferTo(tempFile);
        } catch (Exception e) {
            log.error("Cannot process file", e);
            throw new BusinessException("Cannot process file");
        }

        // Kiểm tra định dạng file
        String fileExtension = ClassroomService.getExtension(tempFile);
        if (!"jpg".equalsIgnoreCase(fileExtension) && !"png".equalsIgnoreCase(fileExtension)) {
            throw new BusinessException("Invalid file format. Only JPG and PNG are allowed.");
        }

        // Tạo thư mục lưu trữ ảnh nếu chưa tồn tại
        String finalPath = "image/User/" + user.getId() + "/";
        File finalFolder = new File(finalPath);
        if (!finalFolder.exists()) {
            finalFolder.mkdirs();
        }

        // Định nghĩa đường dẫn cuối cùng cho file
        File finalFile = new File(finalPath, file.getOriginalFilename());
        try {
            // Di chuyển file từ thư mục tạm đến thư mục đích
            Files.move(tempFile.toPath(), finalFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
        } catch (Exception e) {
            log.error("Cannot move file to /document folder", e);
            throw new BusinessException("Cannot move file to /document folder");
        }

        // Cập nhật đường dẫn ảnh trong thông tin sinh viên
        String imageUrl = finalPath + file.getOriginalFilename(); // Lưu đường dẫn relative vào DB
        user.setImageURL(imageUrl);
        List<ClassRegistration> classRegistrations = classRegistrationRepository.findAllByEmail(user.getEmail());
        for (ClassRegistration classRegistration : classRegistrations) {
            classRegistration.setImgURLRequest(imageUrl);
        }
        classRegistrationRepository.saveAll(classRegistrations);

        // Lưu thay đổi và trả về true
        userRepository.save(user);
        return true;
    }

    private boolean verifyEmail(String code, User user) {
//        Instant startOfToday = LocalDate.now().atStartOfDay(ZoneOffset.UTC).toInstant();
//        if (user.getNumberActiveAttempt() >= 3) {
//            if (user.getLastActiveAttempt().isAfter(startOfToday)) {
//                throw new BusinessException("Only 3 times to verify email a day, please try in next day!");
//            } else {
//                user.setNumberActiveAttempt(0);
//            }
//        }
        boolean result = StringUtils.equalsIgnoreCase(code, user.getActiveCode());
        user.setNumberActiveAttempt(user.getNumberActiveAttempt() + 1);
        user.setLastActiveAttempt(Instant.now());

        return result;
    }

    public ApiResponse sendMailForgotPassword(String email) {
        User user = userRepository.findFirstByEmail(email)
                .orElseThrow(() -> new BusinessException("Not found user with email: " + email));

        String activeCode = RandomStringUtils.randomAlphanumeric(6);
        user.setActiveCode(activeCode);
        userRepository.save(user);

        EmailDetail emailDetail = new EmailDetail();
        emailDetail.setSubject("Classroom verification");
        emailDetail.setMsgBody("Here is your code to reset your password: " + user.getActiveCode());
        emailDetail.setRecipient(email);

        log.info("Sending email forgot password for email {}", user.getEmail());
        emailService.sendSimpleEmail(emailDetail);

        return new ApiResponse(true, "Sent email forgot password!");
    }

    public ApiResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findFirstByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Not found user with email: " + request.getEmail()));
        boolean result = verifyEmail(request.getCode(), user);
        if (result) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }
        userRepository.save(user);
        return result ? new ApiResponse(true, "Success") : new ApiResponse(false, "Failed");
    }

    public List<User> findAllByEmailIn(List<String> emails) {
        return userRepository.findAllByEmailIn(emails);
    }

    public boolean isEmailExisting(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean activateTeacherAccount(Long teacherId) {
        // Fetch the user by ID
        Optional<User> teacherOptional = userRepository.findById(teacherId);

        if (teacherOptional.isPresent()) {
            User teacher = teacherOptional.get();

            // Ensure the user has a TEACHER role and is inactive
            if (teacher.getRole() != null && RoleName.TEACHER.equals(teacher.getRole().getName()) && !teacher.getActive()) {
                teacher.setActive(true); // Activate the account
                teacher.setDeleted(false); // Activate the account
                userRepository.save(teacher); // Save the updated user
                return true;
            }
        }
        return false; // Return false if the user doesn't exist or conditions aren't met
    }

    public String deleteTeacherAccount(Long teacherId) {
        Optional<User> teacherOptional = userRepository.findById(teacherId);

        if (teacherOptional.isPresent()) {
            User teacher = teacherOptional.get();

            // Ensure the user has a TEACHER role
            if (teacher.getRole() != null && RoleName.TEACHER.equals(teacher.getRole().getName())) {
                if (teacher.getActive() && !teacher.getDeleted()) {
                    // If active, deactivate the account
                    teacher.setActive(false);
                    teacher.setDeleted(true);
                    userRepository.save(teacher);
                    return "Deactivated";
                } else if (!teacher.getActive() && !teacher.getDeleted()){
                    userRepository.delete(teacher);
                    return "Deleted";
                }
            }
        }
        return "Invalid"; // Return "Invalid" if user doesn't exist or isn't a TEACHER
    }

    // Activate a student
    public boolean activateStudent(Long studentId) {
        Optional<User> studentOptional = userRepository.findById(studentId);
        if (studentOptional.isPresent()) {
            User student = studentOptional.get();
            if (RoleName.STUDENT.equals(student.getRole().getName()) && !student.getActive()) {
                student.setActive(true);
                student.setDeleted(false);
                userRepository.save(student);
                return true;
            }
        }
        return false;
    }

    // Disable a student
    public boolean disableStudent(Long studentId) {
        Optional<User> studentOptional = userRepository.findById(studentId);
        if (studentOptional.isPresent()) {
            User student = studentOptional.get();
            if (RoleName.STUDENT.equals(student.getRole().getName()) && student.getActive()) {
                student.setActive(false);
                student.setDeleted(true);
                userRepository.save(student);
                return true;
            }
        }
        return false;
    }

    public List<UserDetailDto> getTeacherByActiveAndDeleted(boolean active, boolean deleted) {
        return userRepository.findByRoleNameAndActiveAndDeleted(RoleName.TEACHER, active, deleted)
                .stream()
                .map(UserDetailDto::new)
                .collect(Collectors.toList());
    }

    public List<UserDetailDto> getStudentByActiveAndDeleted(boolean active, boolean deleted) {
        return userRepository.findByRoleNameAndActiveAndDeleted(RoleName.STUDENT, active, deleted)
                .stream()
                .map(UserDetailDto::new)
                .collect(Collectors.toList());
    }

    public Boolean verifyEmailToCreateAccount(String email, String code) {
        Optional<EmailCode> emailCode = emailCodeRepository.findById(email);
        if (emailCode.isEmpty()) return false;

        return StringUtils.equals(emailCode.get().getCode(), code);
    }

    public Boolean sendEmailCode(String email) {
        String activeCode = RandomStringUtils.randomAlphanumeric(6);
        EmailCode emailCode = new EmailCode();
        emailCode.setEmail(email);
        emailCode.setCode(activeCode);
        emailCodeRepository.save(emailCode);

        EmailDetail emailDetail = new EmailDetail();
        emailDetail.setSubject("Xác thực tài khoản lớp học");
        emailDetail.setMsgBody("Đây là mã xác thực tài khoản email của bạn: " + emailCode.getCode());
        emailDetail.setRecipient(email);

        log.info("Sending email forgot password for email {}", emailCode.getEmail());
        emailService.sendSimpleEmail(emailDetail);

        return true;
    }

    public boolean isExistingEmailInWishList(String email) {
        return classRegistrationRepository.existsByEmail(email);
    }

    public boolean isExistingRequestInWishList(String email, Long classroomId) {
        return classRegistrationRepository.existsByEmailAndClassroomId(email, classroomId);
    }
}
