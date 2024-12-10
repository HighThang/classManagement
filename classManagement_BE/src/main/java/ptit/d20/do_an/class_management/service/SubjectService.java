package ptit.d20.do_an.class_management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ptit.d20.do_an.class_management.domain.Subject;
import ptit.d20.do_an.class_management.domain.User;
import ptit.d20.do_an.class_management.dto.SubjectDto;
import ptit.d20.do_an.class_management.enumeration.RoleName;
import ptit.d20.do_an.class_management.repository.SubjectRepository;
import ptit.d20.do_an.class_management.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SubjectService {
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    @Autowired
    public SubjectService(SubjectRepository subjectRepository, UserRepository userRepository) {
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
    }

//    // Get all subjects
//    public List<SubjectDto> getAllSubjects() {
//        List<Subject> subjects = subjectRepository.findAll();
//        return subjects.stream().map(SubjectDto::new).collect(Collectors.toList());
//    }

    // Activate a subject by ID
    public boolean activateSubject(Integer id) {
        // Find the subject by ID
        Optional<Subject> subjectOptional = subjectRepository.findById(id);
        if (subjectOptional.isPresent()) {
            Subject subject = subjectOptional.get();
            subject.setActive(1); // Set active to 1
            subject.setDeleted(0); // Set active to 1
            subjectRepository.save(subject); // Save the updated subject
            return true;
        } else {
            return false;
        }
    }

    // Delete a subject (either mark as deleted or remove from DB)
    public boolean deleteSubject(Integer id) {
        Optional<Subject> subjectOptional = subjectRepository.findById(id);
        if (subjectOptional.isPresent()) {
            Subject subject = subjectOptional.get();

            // If active = 1, set active = 0 and deleted = 1
            if (subject.getActive() == 1) {
                subject.setActive(0); // Set active to 0 (inactive)
                subject.setDeleted(1); // Set deleted to 1
                subjectRepository.save(subject); // Save the updated subject
                return true;
            }

            // If active = 0 and deleted = 0, remove from the database
            if (subject.getActive() == 0 && subject.getDeleted() == 0) {
                subjectRepository.delete(subject); // Delete the subject from the database
                return true;
            }
        }
        return false; // If subject not found or no conditions met
    }

    // Get subjects by active and deleted status
    public List<SubjectDto> getSubjectsByActiveAndDeleted(boolean active, boolean deleted) {
        List<Subject> subjects = subjectRepository.findByActiveAndDeleted(active ? 1 : 0, deleted ? 1 : 0);

        // Map Subject to SubjectDto
        return subjects.stream().map(subject -> {
            String teacherName = getTeacherName(subject.getIdTeacher());
            return new SubjectDto(subject, teacherName);
        }).collect(Collectors.toList());
    }

    // Lấy họ tên đầy đủ của giáo viên từ bảng user
    private String getTeacherName(Long idTeacher) {
        Optional<User> teacherOptional = userRepository.findByIdAndRoleName(idTeacher, RoleName.TEACHER);
        if (teacherOptional.isPresent()) {
            User teacher = teacherOptional.get();
            return String.join(" ", teacher.getLastName(), teacher.getSurname(), teacher.getFirstName());
        }
        return "N/A"; // Trả về "N/A" nếu không tìm thấy giáo viên
    }

    // API tạo môn học
    public Subject createSubject(String subName, Long idTeacher) {
        // Kiểm tra idTeacher có tồn tại và là TEACHER
        User teacher = userRepository.findByIdAndRoleName(idTeacher, RoleName.TEACHER)
                .orElseThrow(() -> new IllegalArgumentException("Invalid teacher ID or not a teacher"));

        // Tạo môn học mới
        Subject newSubject = new Subject();
        newSubject.setSubName(subName);
        newSubject.setIdTeacher(idTeacher);
        newSubject.setActive(0); // Mặc định là 0
        newSubject.setDeleted(0); // Mặc định là 0

        // Lưu vào DB
        return subjectRepository.save(newSubject);
    }

    // Lấy danh sách môn học có active = 1 và deleted = 0
    public List<SubjectDto> getActiveSubjects() {
        List<Subject> subjects = subjectRepository.findByActiveAndDeleted(1, 0);

        // Lấy tên giáo viên từ bảng User
        return subjects.stream().map(subject -> {
            String teacherName = userRepository.findById(subject.getIdTeacher())
                    .map(user -> user.getLastName() + " " + user.getSurname() + " " + user.getFirstName())
                    .orElse("Unknown Teacher");
            return new SubjectDto(subject, teacherName);
        }).collect(Collectors.toList());
    }
}