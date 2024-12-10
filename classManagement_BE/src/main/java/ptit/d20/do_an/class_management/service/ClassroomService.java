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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ptit.d20.do_an.class_management.domain.User;
import ptit.d20.do_an.class_management.exception.BusinessException;
import ptit.d20.do_an.class_management.exception.ResourceNotFoundException;
import ptit.d20.do_an.class_management.repository.ClassRegistrationRepository;
import ptit.d20.do_an.class_management.security.SecurityUtils;
import ptit.d20.do_an.class_management.domain.ClassRegistration;
import ptit.d20.do_an.class_management.domain.Classroom;
import ptit.d20.do_an.class_management.dto.ApiResponse;
import ptit.d20.do_an.class_management.dto.RequestRegistrationDto;
import ptit.d20.do_an.class_management.dto.classroom.ClassroomDto;
import ptit.d20.do_an.class_management.dto.classroom.NewClassRequest;
import ptit.d20.do_an.class_management.dto.StudentDto;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
//            classroomDto.setNumberOfStudent(classroom.getClassRegistrations().size());
            classroomDto.setCreatedDate(classroom.getCreatedDate());

            return classroomDto;
        }).collect(Collectors.toList());
    }

    public ApiResponse createNewClass(NewClassRequest request) {
        User currentLoginUser = SecurityUtils.getCurrentUserLogin()
                .flatMap(userRepository::findByUsername)
                .orElseThrow(() -> new BusinessException("Can not find current user login!"));

        if (currentLoginUser.getRole().getName() != RoleName.TEACHER) {
            throw new BusinessException("Only teacher can create new class!");
        }

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

//    public ApiResponse uploadListCsvStudent(MultipartFile f) {
//        File file = new File("/temp/" + f.getOriginalFilename());
//        try {
//            f.transferTo(file);
//        } catch (Exception e) {
//            log.error("Can not process file", e);
//            throw new BusinessException("Cannot process file");
//        }
//
//        log.info("Parsing csv file {}", file.getName());
//        CsvSchema csvSchema = CsvSchema.builder().setUseHeader(true).build();
//        CsvMapper csvMapper = new CsvMapper();
//        csvMapper.enable(CsvParser.Feature.TRIM_SPACES);
//        csvMapper.addMixIn(PriceRaw.class, PriceRawFormat.class);
//        try {
//            MappingIterator<StudentDto> mappingIterator = csvMapper.readerFor(StudentDto.class).with(csvSchema).readValues(file);
//
//            List<StudentDto> dtos = new ArrayList<>();
//            MappingIterator<StudentDto> studentDtoMappingIteratorMappingIterator = csvMapper.readerFor(StudentDto.class).with(csvSchema)
//                    .readValues(file);
//            return priceRawMappingIterator.readAll();
//        } catch (Exception e) {
//            log.error("Failed to process price file {}", file.getName(), e);
//            return new ArrayList<>();
//        }
//
//        return new ApiResponse(true, "Success");
//
//    }

    public ApiResponse uploadListXlsxStudent(MultipartFile f, Long classId) {
        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Not found classroom!"));

        File file = new File(tempFolder + "/" + f.getOriginalFilename());
        try {
            f.transferTo(file);
        } catch (Exception e) {
            log.error("Can not process file", e);
            throw new BusinessException("Cannot process file");
        }

        String fileExtension = getExtension(file);
        if (!StringUtils.equalsIgnoreCase(fileExtension, "xlsx")) {
            throw new BusinessException("Only process file Xlsx");
        }

        List<StudentDto> studentDtos = getStudentDtos(file);
        storeToDatabase(studentDtos, classroom);
        return new ApiResponse(true, "Success");
    }

    private void storeToDatabase(List<StudentDto> studentDtos, Classroom classroom) {
        String currentLogin = SecurityUtils.getCurrentUserLogin()
                .orElseThrow(() -> new BusinessException("Not found current user login"));
        User currentUserLogin = userRepository.findByUsername(currentLogin)
                .orElseThrow(() -> new BusinessException("Not found user with login " + currentLogin));
        List<String> emails = studentDtos.stream().map(StudentDto::getEmail).collect(Collectors.toList());
        List<User> users = userService.findAllByEmailIn(emails);
        List<ClassRegistration> students = new ArrayList<>();
        studentDtos.forEach(studentDto -> {
            ClassRegistration student = new ClassRegistration();
            student.setFirstName(studentDto.getFirstName());
            student.setSurname(studentDto.getSurname());
            student.setLastName(studentDto.getLastName());
            student.setEmail(studentDto.getEmail());
            student.setPhone(studentDto.getPhone());
            student.setAddress(studentDto.getAddress());
            student.setCreatedBy(currentUserLogin.getUsername());
            student.setCreatedDate(Instant.now());
            student.setRegistrationDate(Instant.now());
            student.setEmailConfirmed(false);
            student.setClassroom(classroom);
            Optional<User> existingUser = users.stream().filter(user -> StringUtils.equalsIgnoreCase(user.getEmail(), student.getEmail())).findAny();
            if (existingUser.isPresent()) {
                student.setStudent(existingUser.get());
            } else {
                if (StringUtils.isNotBlank(student.getEmail())) {
                    try {
                        userService.createDefaultStudentAccount(student);
                    } catch (Exception e) {
                        log.error("Failed to create account for email {}", student.getEmail());
                    }
                }
            }
            students.add(student);
        });

        classRegistrationRepository.saveAll(students);
        log.info("Saved {} student for class: {}, teacher: {}",
                students.size(), classroom.getClassName(), currentUserLogin.getUsername());
    }

    private static List<StudentDto> getStudentDtos(File file) {
        List<StudentDto> studentDtos = new ArrayList<>();
        try {
            FileInputStream xlsxIs = new FileInputStream(file);
            XSSFWorkbook xlsx = new XSSFWorkbook(xlsxIs);
            XSSFSheet sheet = xlsx.getSheetAt(0);
            for (int rowNum = 1; rowNum < sheet.getPhysicalNumberOfRows(); rowNum++) {
                XSSFRow row = sheet.getRow(rowNum);
                StudentDto studentDto = new StudentDto();
                studentDto.setFirstName(row.getCell(0).getStringCellValue());
                studentDto.setSurname(row.getCell(1).getStringCellValue());
                studentDto.setLastName(row.getCell(2).getStringCellValue());
                studentDto.setEmail(row.getCell(3).getStringCellValue());
                studentDto.setPhone(getStringCellValue(row, 4));
                studentDto.setAddress(getStringCellValue(row, 5));
                XSSFCell dob = row.getCell(6);
                if (dob != null) {
                    studentDto.setDob(dob.getDateCellValue());
                }

                studentDtos.add(studentDto);
            }

        } catch (IOException e) {
            log.error("Can not parser file", e);
        }
        return studentDtos;
    }

    private static String getStringCellValue(XSSFRow row, int cellnum) {
        XSSFCell cell = row.getCell(cellnum);
        return cell != null ? cell.getStringCellValue() : null;
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

    public Page<Classroom> search(Map<String, String> params, Pageable pageable) {
        User currentLoginUser = SecurityUtils.getCurrentUserLogin()
                .flatMap(userRepository::findByUsername)
                .orElseThrow(() -> new BusinessException("Can not find current user login!"));
        if (currentLoginUser.getRole().getName() != RoleName.TEACHER) {
            throw new BusinessException("Require Role Teacher!");
        }
        Specification<Classroom> specs = getSpecification(params, currentLoginUser);
        return classroomRepository.findAll(specs, pageable);
    }

    private Specification<Classroom> getSpecification(Map<String, String> params, User currentUser) {
        return Specification.where((root, criteriaQuery, criteriaBuilder) -> {
            Predicate predicate = null;
            List<Predicate> predicateList = new ArrayList<>();
            for (Map.Entry<String, String> p : params.entrySet()) {
                String key = p.getKey();
                String value = p.getValue();
                if (!"page".equalsIgnoreCase(key) && !"size".equalsIgnoreCase(key) && !"sort".equalsIgnoreCase(key)) {
                    if (StringUtils.equalsIgnoreCase("startCreatedDate", key)) { //"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
                        predicateList.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdDate"), LocalDate.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd")).atStartOfDay().toInstant(ZoneOffset.UTC)));
                    } else if (StringUtils.equalsIgnoreCase("endCreatedDate", key)) {
                        predicateList.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdDate"), LocalDate.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd")).atStartOfDay().toInstant(ZoneOffset.UTC)));
                    } else {
                        if (value != null && (value.contains("*") || value.contains("%"))) {
                            predicateList.add(criteriaBuilder.like(root.get(key), "%" + value + "%"));
                        } else if (value != null) {
                            predicateList.add(criteriaBuilder.like(root.get(key), value + "%"));
                        }
                    }
                }
            }

            if (currentUser != null) {
                predicateList.add(criteriaBuilder.equal(root.get("teacher"), currentUser.getId()));
            }

            if (!predicateList.isEmpty()) {
                predicate = criteriaBuilder.and(predicateList.toArray(new Predicate[]{}));
            }

            return predicate;
        });
    }

    public Page<Classroom> searchClassForStudent(Map<String, String> params, Pageable pageable) {
        User currentLoginUser = SecurityUtils.getCurrentUserLogin()
                .flatMap(userRepository::findByUsername)
                .orElseThrow(() -> new BusinessException("Can not find current user login!"));
        if (currentLoginUser.getRole().getName() != RoleName.STUDENT) {
            throw new BusinessException("Require Role Student!");
        }
        List<ClassRegistration> classRegistrations = classRegistrationRepository.findAllByStudentId(currentLoginUser.getId());
        List<Classroom> classrooms = classRegistrations.stream().map(ClassRegistration::getClassroom).collect(Collectors.toList());
        List<Long> classIds = classrooms.stream().map(Classroom::getId).collect(Collectors.toList());
        if (classIds.isEmpty()) {
            return new PageImpl<>(new ArrayList<>());
        }
        Specification<Classroom> specs = getSpecificationForStudent(params, classIds);
        return classroomRepository.findAll(specs, pageable);
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
        classroomDto.setTeacherName(teacher.getFirstName() + " " + teacher.getSurname() + " " + teacher.getLastName());

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
        classroom = classroomRepository.save(classroom);
        log.info("Updated classroom with id {}, name {}", classroom.getId(), classroom.getClassName());
        return buildClassroomDto(classroom);
    }

    public List<String> getAvailableSubjects() {
        return classroomRepository.findDistinctSubjectNames();
    }

    public List<String> getAvailableTeachers(String subjectName) {
        List<Classroom> classrooms = classroomRepository.findAllBySubjectName(subjectName);
        List<String> availableClasses = new ArrayList<>();
        for (Classroom classroom : classrooms) {
            User teacher = classroom.getTeacher();
            String classNameAndTeacherName = classroom.getId() + " - " + classroom.getClassName() + " - "
                    + teacher.getLastName() + " " + teacher.getSurname() + " " + teacher.getFirstName();
            availableClasses.add(classNameAndTeacherName);
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
        // Lấy thông tin student từ ID
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
}
