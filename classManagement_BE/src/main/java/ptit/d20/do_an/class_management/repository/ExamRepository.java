package ptit.d20.do_an.class_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ptit.d20.do_an.class_management.domain.Exam;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
}
