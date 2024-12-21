package ptit.d20.do_an.class_management.service;

import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ptit.d20.do_an.class_management.domain.User;
import ptit.d20.do_an.class_management.dto.*;
import ptit.d20.do_an.class_management.exception.BusinessException;
import ptit.d20.do_an.class_management.exception.ResourceNotFoundException;
import ptit.d20.do_an.class_management.repository.ClassRegistrationRepository;
import ptit.d20.do_an.class_management.security.SecurityUtils;
import ptit.d20.do_an.class_management.domain.ClassRegistration;
import ptit.d20.do_an.class_management.domain.Classroom;
import ptit.d20.do_an.class_management.dto.ClassroomDto;
import ptit.d20.do_an.class_management.dto.NewClassRequest;
import ptit.d20.do_an.class_management.enumeration.RoleName;
import ptit.d20.do_an.class_management.repository.ClassScheduleRepository;
import ptit.d20.do_an.class_management.repository.ClassroomRepository;
import ptit.d20.do_an.class_management.repository.UserRepository;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Log4j2
@Service
public class ClassroomService {
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;
    private final ClassRegistrationRepository classRegistrationRepository;
    private final UserService userService;
    private final ClassScheduleRepository classScheduleRepository;
    private final String tempFolder;

    @Autowired
    public ClassroomService(ClassroomRepository classroomRepository,
                            UserRepository userRepository,
                            ClassRegistrationRepository classRegistrationRepository,
                            UserService userService,
                            ClassScheduleRepository classScheduleRepository, @Value("${app.temp}") String tempFolder) {
        this.classroomRepository = classroomRepository;
        this.userRepository = userRepository;
        this.classRegistrationRepository = classRegistrationRepository;
        this.userService = userService;
        this.classScheduleRepository = classScheduleRepository;
        this.tempFolder = tempFolder;
    }

    public List<ClassroomDto> getClassroomForCurrentUser() {
        User currentLoginUser = SecurityUtils.getCurrentUserLogin()
                .flatMap(userRepository::findByUsername)
                .orElseThrow(() -> new BusinessException("Can not find current user login!"));

        //todo specific dto information return for teacher, student
        List<Classroom> classrooms = classroomRepository.findAllByTeacherId(currentLoginUser.getId());
        return classrooms.stream().map(classroom -> {
            ClassroomDto classroomDto = new ClassroomDto();
            classroomDto.setId(classroom.getId());
            classroomDto.setClassName(classroom.getClassName());
            classroomDto.setSubjectName(classroom.getSubjectName());
            classroomDto.setNote(classroom.getNote());
            classroomDto.setCreatedDate(classroom.getCreatedDate());

            return classroomDto;
        }).collect(Collectors.toList());
    }

    public ApiResponse createNewClass(NewClassRequest request) {
        User currentLoginUser = SecurityUtils.getCurrentUserLogin()
                .flatMap(userRepository::findByUsername)
                .orElseThrow(() -> new BusinessException("Can not find current user login!"));

        // Kiểm tra xem người dùng hiện tại có phải là giáo viên không
        if (currentLoginUser.getRole().getName() != RoleName.TEACHER) {
            throw new BusinessException("Only teacher can create new class!");
        }

        // Kiểm tra xem giáo viên đã từng tạo lớp với tên này chưa
        boolean classExists = classroomRepository.existsByTeacherIdAndClassNameAndSubjectName(
                currentLoginUser.getId(),
                request.getClassName(),
                request.getSubjectName()
        );
        if (classExists) {
            throw new BusinessException("Lớp học của bạn đã tồn tại!");
        }

        // Tạo lớp học mới
        Classroom newClass = new Classroom();
        newClass.setClassName(request.getClassName());
        newClass.setSubjectName(request.getSubjectName());
        newClass.setNote(request.getNote());
        newClass.setTeacher(currentLoginUser);
        newClass.setDeleted(false);

        classroomRepository.save(newClass);

        log.info("Created new class for teacher with login {}", currentLoginUser.getUsername());
        return new ApiResponse(true, "Created new class successfully");
    }

    public static String getExtension(File file) {
        String extension = "";
        String fileName = file.getName();
        int i = fileName.lastIndexOf('.');
        if (i > 0) {
            extension = fileName.substring(i + 1);
        }
        return extension;
    }

    public List<ClassroomStatusForStudentDto>searchClassForStudent(Map<String, String> params) {
        User currentLoginUser = SecurityUtils.getCurrentUserLogin()
                .flatMap(userRepository::findByUsername)
                .orElseThrow(() -> new BusinessException("Can not find current user login!"));
        if (currentLoginUser.getRole().getName() != RoleName.STUDENT) {
            throw new BusinessException("Require Role Student!");
        }
        List<ClassRegistration> classRegistrations = classRegistrationRepository.findAllByStudentIdAndActiveOrDeleted(currentLoginUser.getId());

//        List<Classroom> classrooms = classRegistrations.stream().map(ClassRegistration::getClassroom).collect(Collectors.toList());
        List<ClassroomStatusForStudentDto> classroomStatusList = classRegistrations.stream()
                .map(registration -> new ClassroomStatusForStudentDto(
                        registration.getClassroom(),
                        registration.getActive(),
                        registration.getDeleted()))
                .collect(Collectors.toList());

//        List<Long> classIds = classrooms.stream().map(Classroom::getId).collect(Collectors.toList());
        List<Long> classIds = classroomStatusList.stream()
                .map(dto -> dto.getClassroom().getId())
                .collect(Collectors.toList());

        if (classIds.isEmpty()) {
            return new ArrayList<>();
        }

//        Specification<Classroom> specs = getSpecificationForStudent(params, classIds);
//        return classroomRepository.findAll(specs);
        Specification<Classroom> specs = getSpecificationForStudent(params, classIds);
        List<Classroom> filteredClassrooms = classroomRepository.findAll(specs);

        // Lọc lại danh sách classroomStatusList để chỉ giữ các lớp học nằm trong kết quả filteredClassrooms
        Set<Long> filteredClassIds = filteredClassrooms.stream()
                .map(Classroom::getId)
                .collect(Collectors.toSet());

        return classroomStatusList.stream()
                .filter(dto -> filteredClassIds.contains(dto.getClassroom().getId()))
                .collect(Collectors.toList());
    }

    private Specification<Classroom> getSpecificationForStudent(Map<String, String> params, List<Long> classIds) {
        return Specification.where((root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicateList = new ArrayList<>();

            // Process parameters for filtering
            for (Map.Entry<String, String> p : params.entrySet()) {
                String key = p.getKey();
                String value = p.getValue();

                if (!"page".equalsIgnoreCase(key) && !"size".equalsIgnoreCase(key) && !"sort".equalsIgnoreCase(key)) {
                    if (StringUtils.equalsIgnoreCase("startCreatedDate", key)) {
                        // "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
                        predicateList.add(criteriaBuilder.greaterThanOrEqualTo(
                                root.get("createdDate"),
                                LocalDate.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd")).atStartOfDay().toInstant(ZoneOffset.UTC)
                        ));
                    } else if (StringUtils.equalsIgnoreCase("endCreatedDate", key)) {
                        predicateList.add(criteriaBuilder.lessThanOrEqualTo(
                                root.get("createdDate"),
                                LocalDate.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd")).atStartOfDay().toInstant(ZoneOffset.UTC)
                        ));
                    } else {
                        if (value != null && (value.contains("*") || value.contains("%"))) {
                            predicateList.add(criteriaBuilder.like(root.get(key), "%" + value + "%"));
                        } else if (value != null) {
                            predicateList.add(criteriaBuilder.like(root.get(key), value + "%"));
                        }
                    }
                }
            }

            // Add predicate for classIds
            if (classIds != null && !classIds.isEmpty()) {
                CriteriaBuilder.In<Long> inClause = criteriaBuilder.in(root.get("id"));
                for (Long classId : classIds) {
                    inClause.value(classId);
                }
                predicateList.add(inClause);
            }

            // Combine all predicates
            Predicate finalPredicate = null;
            if (!predicateList.isEmpty()) {
                finalPredicate = criteriaBuilder.and(predicateList.toArray(new Predicate[0]));
            }

            return finalPredicate;
        });
    }

    public Object getClassDetail(Long classId) {
        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Not found class"));
        return buildClassroomDto(classroom);
    }

    private static ClassroomDto buildClassroomDto(Classroom classroom) {
        ClassroomDto classroomDto = new ClassroomDto();
        classroomDto.setId(classroom.getId());
        classroomDto.setClassName(classroom.getClassName());
        classroomDto.setNote(classroom.getNote());
        classroomDto.setSubjectName(classroom.getSubjectName());
        classroomDto.setCreatedDate(classroom.getCreatedDate());
        User teacher = classroom.getTeacher();
        classroomDto.setTeacherName(teacher.getLastName() + " " + teacher.getSurname() + " " + teacher.getFirstName());
        classroomDto.setTeacherEmail(teacher.getEmail());
        classroomDto.setTeacherPhone(teacher.getPhone());

        return classroomDto;
    }

    public Classroom getById(Long classId) {
        return classroomRepository.findById(classId).orElseThrow(() -> new ResourceNotFoundException("Not found class"));
    }

    public ClassroomDto updateClassDetail(ClassroomDto classroomDto) {
        Classroom classroom = getById(classroomDto.getId());

        if (StringUtils.isNotBlank(classroomDto.getClassName())) {
            classroom.setClassName(classroomDto.getClassName());
        }
        if (StringUtils.isNotBlank(classroomDto.getSubjectName())) {
            classroom.setSubjectName(classroomDto.getSubjectName());
        }
        if (StringUtils.isNotBlank(classroomDto.getNote())) {
            classroom.setNote(classroomDto.getNote());
        }

        boolean classExists = classroomRepository.existsByTeacherIdAndClassNameAndSubjectNameAndIdNot(
                classroom.getTeacher().getId(),
                classroom.getClassName(),
                classroom.getSubjectName(),
                classroom.getId()
        );
        if (classExists) {
            throw new BusinessException("Lớp học của bạn đã tồn tại!");
        }

        classroom = classroomRepository.save(classroom);
        log.info("Updated classroom with id {}, name {}", classroom.getId(), classroom.getClassName());
        return buildClassroomDto(classroom);
    }

    public List<String> getAvailableSubjects() {
        return classroomRepository.findDistinctSubjectNames();
    }

    public List<AvailableTeachersDto> getAvailableTeachers(String subjectName) {
        List<Classroom> classrooms = classroomRepository.findAllBySubjectName(subjectName);
        List<AvailableTeachersDto> availableClasses = new ArrayList<>();

        for (Classroom classroom : classrooms) {
            if (classroom.getTeacher().getActive() == false) {
                continue;
            }

            User teacher = classroom.getTeacher();

            String basicInfo = classroom.getId() + " - " + classroom.getClassName() + " - "
                    + teacher.getLastName() + " " + teacher.getSurname() + " " + teacher.getFirstName();

            Map<String, String> additionalInfo = Map.of(
                    "note", classroom.getNote() != null ? classroom.getNote() : "N/A",
                    "phone", teacher.getPhone(),
                    "email", teacher.getEmail(),
                    "business", teacher.getBusiness()
            );

            availableClasses.add(new AvailableTeachersDto(basicInfo, additionalInfo));
        }

        return availableClasses;
    }

    public Long createRequestToClass(RequestRegistrationDto requestRegistrationDto) {
        Classroom classroom = classroomRepository.findById(requestRegistrationDto.getIdClassroom())
                .orElseThrow(() -> new ResourceNotFoundException("Not found classroom!"));

        ClassRegistration student = new ClassRegistration();
        student.setFirstName(requestRegistrationDto.getFirstName());
        student.setSurname(requestRegistrationDto.getSurName());
        student.setLastName(requestRegistrationDto.getLastName());
        student.setEmail(requestRegistrationDto.getEmail());
        student.setPhone(requestRegistrationDto.getPhone());
        student.setAddress(requestRegistrationDto.getAddress());
        student.setDob(requestRegistrationDto.getDob());
        student.setCreatedDate(Instant.now());
        student.setRegistrationDate(Instant.now());
        student.setEmailConfirmed(false);
        student.setClassroom(classroom);
        student.setActive(false);
        student.setDeleted(false);

        if (requestRegistrationDto.getIdStudent() != null && requestRegistrationDto.getImgUrlRequest() != null) {
            student.setImgURLRequest(requestRegistrationDto.getImgUrlRequest());

            List<User> users = userService.findAllByEmailIn(List.of(requestRegistrationDto.getEmail()));
            ClassRegistration finalStudent = student;
            Optional<User> existingUser = users.stream().filter(user -> StringUtils.equalsIgnoreCase(user.getEmail(), finalStudent.getEmail())).findAny();
            existingUser.ifPresent(student::setStudent);
            if (existingUser.isPresent()) {
                student.setStudent(existingUser.get());
            }
        }

        student = classRegistrationRepository.save(student);

        return student.getId();
    }

    public Boolean updateImageToClass(Long id, MultipartFile file) {
        ClassRegistration student = classRegistrationRepository.findById(id).orElseThrow(() -> new BusinessException("Student not found"));

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
        String finalPath = "image/classRegistration/" + student.getId() + "/";
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

        String imageUrl = finalPath + file.getOriginalFilename(); // Lưu đường dẫn relative vào DB
        student.setImgURLRequest(imageUrl);

        // Lưu thay đổi và trả về true
        classRegistrationRepository.save(student);
        return true;
    }

    public boolean isTeachersClassroom(Long teacherId, Long id) {
        return classroomRepository.existsByTeacherIdAndId(teacherId, id);
    }

    public boolean isStudentsClassroom(Long studentId, Long classroomId) {
        return classRegistrationRepository.existsByStudentIdAndClassroomIdAndActiveOrDeleted(studentId, classroomId);
    }
}
