package ptit.d20.do_an.class_management.service;

import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ptit.d20.do_an.class_management.exception.BusinessException;
import ptit.d20.do_an.class_management.exception.ResourceNotFoundException;
import ptit.d20.do_an.class_management.repository.ClassAttendanceRepository;
import ptit.d20.do_an.class_management.domain.ClassSchedule;
import ptit.d20.do_an.class_management.domain.Classroom;
import ptit.d20.do_an.class_management.domain.User;
import ptit.d20.do_an.class_management.dto.ApiResponse;
import ptit.d20.do_an.class_management.dto.NewClassScheduleRequest;
import ptit.d20.do_an.class_management.enumeration.RoleName;
import ptit.d20.do_an.class_management.repository.ClassScheduleRepository;
import ptit.d20.do_an.class_management.repository.ClassroomRepository;

import javax.persistence.criteria.Predicate;
import javax.transaction.Transactional;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
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
public class ClassScheduleService {
    private final ClassScheduleRepository classScheduleRepository;
    private final ClassroomRepository classroomRepository;
    private final TutorFeeService tutorFeeService;
    private final UserService userService;
    private final ClassAttendanceRepository classAttendanceRepository;
    private final String tempFolder;

    @Autowired
    public ClassScheduleService(
            ClassScheduleRepository classScheduleRepository,
            ClassroomRepository classroomRepository,
            TutorFeeService tutorFeeService,
            UserService userService, ClassAttendanceRepository classAttendanceRepository, @Value("${app.temp}") String tempFolder) {
        this.classScheduleRepository = classScheduleRepository;
        this.classroomRepository = classroomRepository;
        this.tutorFeeService = tutorFeeService;
        this.userService = userService;
        this.classAttendanceRepository = classAttendanceRepository;
        this.tempFolder = tempFolder;
    }

    public List<ClassSchedule> getAllClassSchedule(Long classId) {
        return classScheduleRepository.findAllByClassroomIdOrderByDayAsc(classId);
    }

    public Page<ClassSchedule> search(Map<String, String> params, Pageable pageable) {
        Specification<ClassSchedule> specs = getSpecification(params);
        return classScheduleRepository.findAll(specs, pageable);
    }

    private Specification<ClassSchedule> getSpecification(Map<String, String> params) {
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
                    } else if (StringUtils.equalsIgnoreCase("classId", key)) {
                        predicateList.add(criteriaBuilder.equal(root.get("classroom").get("id"), Long.valueOf(value)));
                    } else {
                        if (value != null && (value.contains("*") || value.contains("%"))) {
                            predicateList.add(criteriaBuilder.like(root.get(key), "%" + value + "%"));
                        } else if (value != null) {
                            predicateList.add(criteriaBuilder.like(root.get(key), value + "%"));
                        }
                    }
                }
            }

            if (!predicateList.isEmpty()) {
                predicate = criteriaBuilder.and(predicateList.toArray(new Predicate[]{}));
            }

            return predicate;
        });
    }


    public ApiResponse createClassSchedule(NewClassScheduleRequest request) {
        Classroom classroom = classroomRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Not found classroom"));
        List<ClassSchedule> classSchedules = new ArrayList<>();
        for (LocalDate date = request.getStartDate(); !date.isAfter(request.getEndDate()); date = date.plusDays(1)) {
            // Check if the current date matches the specified day of the week
            if (date.getDayOfWeek().name().equals(request.getDayInWeek())) {
                // Create a new ClassSchedule object for the current date
                ClassSchedule classSchedule = new ClassSchedule();
                classSchedule.setClassroom(classroom);
                classSchedule.setDay(date);
                classSchedule.setPeriodInDay(request.getPeriodInDay());
                classSchedule.setDayInWeek(request.getDayInWeek());

                // Add the created ClassSchedule to the list
                classSchedules.add(classSchedule);
            }
        }
        User user = userService.getCurrentUserLogin();
        List<Classroom> classrooms = user.getClassrooms();
        List<ClassSchedule> existingSchedule = classrooms.stream()
                .flatMap(classroom1 -> classroom1.getSchedules().stream())
                .collect(Collectors.toList());
        for (ClassSchedule classSchedule : classSchedules) {
            Optional<ClassSchedule> conflictSchedule = existingSchedule.stream()
                    .filter(existOne -> existOne.getDay().equals(classSchedule.getDay())
                    && existOne.getPeriodInDay().equals(classSchedule.getPeriodInDay()))
                    .findFirst();
            if (conflictSchedule.isPresent()) {
                String message = "Trùng lịch: "
                        + conflictSchedule.get().getClassroom().getClassName()
                        + " - " + classSchedule.getDay()
                        + " - " + classSchedule.getPeriodInDay().getName();
                throw new BusinessException(message);
            }
        }
        classScheduleRepository.saveAll(classSchedules);
        log.info("Created class schedule for class {}", classroom.getClassName());
        return new ApiResponse(true, "success");
    }

    @Transactional
    public ApiResponse deleteSchedule(Long scheduleId) {
        User user = userService.getCurrentUserLogin();
        if (user.getRole().getName() != RoleName.TEACHER) {
            throw new BusinessException("Missing permission");
        }
        List<Classroom> classrooms = user.getClassrooms();
        List<ClassSchedule> schedules = classrooms.stream().flatMap(classroom -> classroom.getSchedules().stream()).collect(Collectors.toList());
        schedules.stream()
                .filter(schedule -> schedule.getId().equals(scheduleId)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Not found schedule"));

        boolean hasRelevantAttendance = classAttendanceRepository.existsByClassScheduleIdAndIsAttended(scheduleId, true);
        if (hasRelevantAttendance) throw new BusinessException("Error");

        try {
            classAttendanceRepository.deleteAllByClassScheduleId(scheduleId);
            classScheduleRepository.deleteById(scheduleId);
        } catch (Exception e) {
            log.error("Exception during delete operation", e);
            throw new BusinessException("Deletion failed due to an error");
        }

        return new ApiResponse(true,"Success");
    }

    public List<ClassSchedule> getSchedulesByTeacherEmail(String email) {
        return classScheduleRepository.findByCreatedBy(email);
    }

    public Boolean uploadImageToAttend(MultipartFile file, Long scheduleId) {
        Optional<ClassSchedule> classSchedule = classScheduleRepository.findById(scheduleId);

        if (classSchedule.isEmpty()) throw new BusinessException("Error");

        // Tạo thư mục tạm thời nếu chưa tồn tại
        File tempFolder = new File(this.tempFolder + "/classAttendance");
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
        String finalPath = "image/classAtendance/" + classSchedule.get().getId() + "/";
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

        classSchedule.get().setImageClassAttendance(imageUrl);

        classScheduleRepository.save(classSchedule.get());

        return true;
    }

    public ClassSchedule getClassScheduleById(Long scheduleId) {
        Optional<ClassSchedule> classSchedule = classScheduleRepository.findById(scheduleId);
        return classSchedule.get();
    }
}
