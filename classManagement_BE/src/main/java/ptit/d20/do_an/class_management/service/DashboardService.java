package ptit.d20.do_an.class_management.service;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ptit.d20.do_an.class_management.dto.AllScheduleDto;
import ptit.d20.do_an.class_management.repository.ClassRegistrationRepository;
import ptit.d20.do_an.class_management.domain.ClassRegistration;
import ptit.d20.do_an.class_management.domain.ClassSchedule;
import ptit.d20.do_an.class_management.domain.Classroom;
import ptit.d20.do_an.class_management.domain.User;
import ptit.d20.do_an.class_management.enumeration.RoleName;
import ptit.d20.do_an.class_management.repository.ClassScheduleRepository;
import ptit.d20.do_an.class_management.repository.ClassroomRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Log4j2
@Service
public class DashboardService {

    private final UserService userService;
    private final ClassroomRepository classroomRepository;
    private final ClassRegistrationRepository classRegistrationRepository;
    private final ClassScheduleRepository classScheduleRepository;

    @Autowired
    public DashboardService(
            UserService userService,
            ClassroomRepository classroomRepository,
            ClassRegistrationRepository classRegistrationRepository,
            ClassScheduleRepository classScheduleRepository) {
        this.userService = userService;
        this.classroomRepository = classroomRepository;
        this.classRegistrationRepository = classRegistrationRepository;
        this.classScheduleRepository = classScheduleRepository;
    }

    public List<AllScheduleDto> fetchClass() {
        User userCurrent = userService.getCurrentUserLogin();
        List<Classroom> classrooms;

        // Lấy danh sách lớp học theo vai trò người dùng
        if (userCurrent.getRole().getName() == RoleName.TEACHER) {
            classrooms = classroomRepository.findAllByTeacherId(userCurrent.getId());
        } else if (userCurrent.getRole().getName() == RoleName.STUDENT) {
            List<ClassRegistration> classRegistrations = classRegistrationRepository.findAllByStudentIdAndActive(userCurrent.getId(), true);
            classrooms = classRegistrations.stream()
                    .map(ClassRegistration::getClassroom)
                    .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }

        List<Long> classIds = classrooms.stream().map(Classroom::getId).collect(Collectors.toList());

        List<ClassSchedule> classSchedules = classScheduleRepository.findAllByClassroomIds(classIds);

        // Map dữ liệu sang DTO
        return classSchedules.stream().map(schedule -> new AllScheduleDto(schedule.getDay(),
                        schedule.getPeriodInDay(), schedule.getClassroom().getClassName())).collect(Collectors.toList());
    }
}
