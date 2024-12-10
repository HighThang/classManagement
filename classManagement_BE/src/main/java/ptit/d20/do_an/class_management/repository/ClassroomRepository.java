package ptit.d20.do_an.class_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ptit.d20.do_an.class_management.domain.Classroom;

import java.util.List;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Long>, JpaSpecificationExecutor<Classroom> {
    List<Classroom> findAllByTeacherId(Long id);

    @Query("SELECT DISTINCT c.subjectName FROM Classroom c")
    List<String> findDistinctSubjectNames();

    List<Classroom> findAllBySubjectName(String subjectName);

    boolean existsByTeacherIdAndId(Long teacherId, Long id);
}
