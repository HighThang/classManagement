package ptit.d20.do_an.class_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ptit.d20.do_an.class_management.domain.ClassRegistration;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface ClassRegistrationRepository extends JpaSpecificationExecutor<ClassRegistration>,
        JpaRepository<ClassRegistration, Long> {
    List<ClassRegistration> findAllByClassroomIdOrderByLastNameAsc(Long classId);

    List<ClassRegistration> findAllByStudentIdAndActive(Long studentId, boolean active);
    List<ClassRegistration> findAllByEmail(String email);

    @Modifying
    @Transactional
    @Query(nativeQuery = true, value = "DELETE FROM class_registration WHERE id = :studentId")
    void deleteById(@Param("studentId") Long documentId);

    boolean existsByEmail(String email);

    boolean existsByStudentIdAndClassroomId(Long studentId, Long classroomId);

    boolean existsByStudentIdAndClassroomIdAndActive(Long studentId, Long classroomId, boolean active);
}
