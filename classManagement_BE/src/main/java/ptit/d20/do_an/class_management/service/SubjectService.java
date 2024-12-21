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

    public boolean activateSubject(Integer id) {
        Optional<Subject> subjectOptional = subjectRepository.findById(id);
        if (subjectOptional.isPresent()) {
            Subject subject = subjectOptional.get();
            subject.setActive(1);
            subject.setDeleted(0);
            subjectRepository.save(subject);
            return true;
        } else {
            return false;
        }
    }

    public boolean deleteSubject(Integer id) {
        Optional<Subject> subjectOptional = subjectRepository.findById(id);
        if (subjectOptional.isPresent()) {
            Subject subject = subjectOptional.get();

            if (subject.getActive() == 1) {
                subject.setActive(0);
                subject.setDeleted(1);
                subjectRepository.save(subject);
                return true;
            }

            if (subject.getActive() == 0 && subject.getDeleted() == 0) {
                subjectRepository.delete(subject);
                return true;
            }
        }
        return false;
    }

    public List<SubjectDto> getSubjectsByActiveAndDeleted(boolean active, boolean deleted) {
        List<Subject> subjects = subjectRepository.findByActiveAndDeleted(active ? 1 : 0, deleted ? 1 : 0);

        return subjects.stream().map(subject -> {
            String teacherName = getTeacherName(subject.getIdTeacher());
            return new SubjectDto(subject, teacherName);
        }).collect(Collectors.toList());
    }

    private String getTeacherName(Long idTeacher) {
        Optional<User> teacherOptional = userRepository.findByIdAndRoleName(idTeacher, RoleName.TEACHER);
        if (teacherOptional.isPresent()) {
            User teacher = teacherOptional.get();
            return String.join(" ", teacher.getLastName(), teacher.getSurname(), teacher.getFirstName());
        }
        return "N/A";
    }

    public Subject createSubject(String subName, Long idTeacher) {
        User teacher = userRepository.findByIdAndRoleName(idTeacher, RoleName.TEACHER)
                .orElseThrow(() -> new IllegalArgumentException("Invalid teacher ID or not a teacher"));

        Subject newSubject = new Subject();
        newSubject.setSubName(subName);
        newSubject.setIdTeacher(idTeacher);
        newSubject.setActive(0);
        newSubject.setDeleted(0);

        return subjectRepository.save(newSubject);
    }

    public boolean checkSubjectExists(String subName) {
        return subjectRepository.existsBySubName(subName);
    }

    public List<SubjectDto> getActiveSubjects() {
        List<Subject> subjects = subjectRepository.findByActiveAndDeleted(1, 0);

        return subjects.stream().map(subject -> {
            String teacherName = userRepository.findById(subject.getIdTeacher())
                    .map(user -> user.getLastName() + " " + user.getSurname() + " " + user.getFirstName())
                    .orElse("Unknown Teacher");
            return new SubjectDto(subject, teacherName);
        }).collect(Collectors.toList());
    }
}