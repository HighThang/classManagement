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
public interface ClassRegistrationRepository extends JpaSpecificationExecutor<ClassRegistration>, JpaRepository<ClassRegistration, Long> {
    List<ClassRegistration> findAllByClassroomIdOrderByLastNameAsc(Long classId);

    List<ClassRegistration> findAllByStudentIdAndActive(Long studentId, boolean active);

    @Query("SELECT cr FROM ClassRegistration cr WHERE cr.student.id = :studentId AND (cr.active = true OR cr.deleted = true)")
    List<ClassRegistration> findAllByStudentIdAndActiveOrDeleted(@Param("studentId") Long studentId);

    List<ClassRegistration> findAllByEmail(String email);

    @Modifying
    @Transactional
    @Query(nativeQuery = true, value = "DELETE FROM class_registration WHERE id = :studentId")
    void deleteById(@Param("studentId") Long documentId);

    boolean existsByEmail(String email);

    boolean existsByStudentIdAndClassroomId(Long studentId, Long classroomId);

//    boolean existsByStudentIdAndClassroomIdAndActive(Long studentId, Long classroomId, boolean active);

    @Query("SELECT COUNT(cr) > 0 FROM ClassRegistration cr WHERE cr.student.id = :studentId AND cr.classroom.id = :classroomId AND (cr.active = true OR cr.deleted = true)")
    boolean existsByStudentIdAndClassroomIdAndActiveOrDeleted(@Param("studentId") Long studentId, @Param("classroomId") Long classroomId);

    @Query("SELECT c FROM ClassRegistration c WHERE c.email = :email AND c.student IS NULL")
    List<ClassRegistration> findAllByEmailAndStudentIsNull(@Param("email") String email);

    boolean existsByEmailAndClassroomId(String email, Long classroomId);
}
