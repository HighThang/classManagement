package ptit.d20.do_an.class_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ptit.d20.do_an.class_management.domain.Subject;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Integer> {
    List<Subject> findAll();
    List<Subject> findByActiveAndDeleted(int active, int deleted);

    boolean existsBySubName(String subName);
}