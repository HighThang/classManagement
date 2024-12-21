package ptit.d20.do_an.class_management.service;

import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import ptit.d20.do_an.class_management.domain.*;
import ptit.d20.do_an.class_management.dto.ApiResponse;
import ptit.d20.do_an.class_management.dto.StudentDto;
import ptit.d20.do_an.class_management.enumeration.RoleName;
import ptit.d20.do_an.class_management.exception.BusinessException;
import ptit.d20.do_an.class_management.exception.ResourceNotFoundException;
import ptit.d20.do_an.class_management.repository.*;

import javax.persistence.criteria.Predicate;
import javax.transaction.Transactional;
import java.io.FileOutputStream;
import java.io.IOException;
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
public class StudentService {
    private final ClassRegistrationRepository classRegistrationRepository;
    private final ClassAttendanceRepository classAttendanceRepository;
    private final TutorFeeDetailRepository tutorFeeDetailRepository;
    private final ExamScoreRepository examScoreRepository;
    private final ClassroomRepository classroomRepository;
    private final UserService userService;
    private final ClassroomService classroomService;
    private final String tempFolder;
    private final UserRepository userRepository;

    @Autowired
    public StudentService(
            ClassRegistrationRepository classRegistrationRepository,
            ClassAttendanceRepository classAttendanceRepository,
            TutorFeeDetailRepository tutorFeeDetailRepository,
            ExamScoreRepository examScoreRepository, ClassroomRepository classroomRepository,
            UserService userService,
            ClassroomService classroomService,
            @Value("${app.temp}") String tempFolder, UserRepository userRepository) {
        this.classRegistrationRepository = classRegistrationRepository;
        this.classAttendanceRepository = classAttendanceRepository;
        this.tutorFeeDetailRepository = tutorFeeDetailRepository;
        this.examScoreRepository = examScoreRepository;
        this.classroomRepository = classroomRepository;
        this.userService = userService;
        this.classroomService = classroomService;
        this.tempFolder = tempFolder;
        this.userRepository = userRepository;
    }

    public List<ClassRegistration> getAllStudentForClass(Long classId) {
        return classRegistrationRepository.findAllByClassroomIdOrderByLastNameAsc(classId);
    }

    public String extractListStudent(Long classId) {
        List<ClassRegistration> students = getAllStudentForClass(classId);
        String fileName = tempFolder + "/" + "students_class_" + classId + ".xlsx";

        Workbook workbook = new XSSFWorkbook();
        try {
            Sheet sheet = workbook.createSheet("Students");

            // Create header row
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("ID");
            headerRow.createCell(1).setCellValue("Họ");
            headerRow.createCell(2).setCellValue("Tên Đệm");
            headerRow.createCell(3).setCellValue("Tên");
            headerRow.createCell(4).setCellValue("Email");
            headerRow.createCell(5).setCellValue("Ngày sinh");
            headerRow.createCell(6).setCellValue("Số điện thoại");
            headerRow.createCell(7).setCellValue("Địa chỉ");

            // Create data rows
            int rowIndex = 1;
            for (ClassRegistration student : students) {
                if (student.getActive() == false) {
                    continue; // Bỏ qua bản ghi này
                }

                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(student.getId());
                row.createCell(1).setCellValue(student.getLastName());
                row.createCell(2).setCellValue(student.getSurname());
                row.createCell(3).setCellValue(student.getFirstName());
                row.createCell(4).setCellValue(student.getEmail());
                if (student.getStudent() != null && student.getStudent().getDob() != null) {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                    String dobFormatted = student.getStudent().getDob().format(formatter);
                    row.createCell(5).setCellValue(dobFormatted);
                }
                row.createCell(6).setCellValue(student.getPhone());
                row.createCell(7).setCellValue(student.getAddress());
            }

            // Write the output to a file
            try (FileOutputStream fileOut = new FileOutputStream(fileName)) {
                workbook.write(fileOut);
            }
        } catch (IOException e) {
            log.error("Error while writing XLSX file", e);
            return null;
        }

        return fileName;
    }

    @Transactional
    public ApiResponse deleteStudent(Long studentId) {
        User user = userService.getCurrentUserLogin();
        if (user.getRole().getName() != RoleName.TEACHER) {
            throw new BusinessException("Missing permission");
        }

        // Kiểm tra quyền truy cập của giáo viên với các lớp học
        List<Classroom> classrooms = user.getClassrooms();
        List<ClassRegistration> classRegistrations = classrooms.stream()
                .flatMap(classroom -> classroom.getClassRegistrations().stream())
                .collect(Collectors.toList());

        // Kiểm tra sự tồn tại của học sinh
        classRegistrations.stream()
                .filter(student -> student.getId().equals(studentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Not found student"));

        // Kiểm tra tồn tại trong Attendance
        boolean hasRelevantAttendance = classAttendanceRepository.existsByClassRegistrationIdAndIsAttended(studentId, true);

        try {
            if (hasRelevantAttendance) {
                // Nếu tồn tại trong Attendance, chỉ cập nhật trạng thái
                classRegistrationRepository.findById(studentId).ifPresent(classRegistration -> {
                    classRegistration.setDeleted(true);
                    classRegistration.setActive(false);
                    classRegistrationRepository.save(classRegistration);
                });
            } else {
                classAttendanceRepository.deleteAllByClassRegistrationId(studentId);
                examScoreRepository.deleteAllByClassRegistrationId(studentId);
                tutorFeeDetailRepository.deleteAllByClassRegistrationId(studentId);
                classRegistrationRepository.deleteById(studentId);
            }
        } catch (Exception e) {
            log.error("Exception during delete operation", e);
            throw new BusinessException("Deletion failed due to an error");
        }

        return new ApiResponse(true, "Success");
    }

    public Object activeStudent(Long studentId) {
        ClassRegistration existingStudent = classRegistrationRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));

        if (existingStudent.getStudent() == null) {
            userService.createDefaultStudentAccount(existingStudent);
        }

        existingStudent.setActive(true);
        existingStudent.setDeleted(false);

        classRegistrationRepository.save(existingStudent);

        return "Success";
    }

    public boolean isExistingRequestInWishList(Long studentId, Long classroomId) {
        return classRegistrationRepository.existsByStudentIdAndClassroomId(studentId, classroomId);
    }
}
