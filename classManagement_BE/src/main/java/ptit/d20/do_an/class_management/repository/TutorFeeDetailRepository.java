package ptit.d20.do_an.class_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ptit.d20.do_an.class_management.domain.TutorFeeDetail;

@Repository
public interface TutorFeeDetailRepository extends JpaRepository<TutorFeeDetail, Long>, JpaSpecificationExecutor<TutorFeeDetail> {
    boolean existsByClassRegistrationId(Long studentId);

    @Modifying
    @Query("DELETE FROM TutorFeeDetail tfd WHERE tfd.classRegistration.id = :studentId")
    void deleteAllByClassRegistrationId(@Param("studentId") Long studentId);

    boolean existsByClassRegistrationIdAndNumberOfAttendedLessonNot(Long studentId, int numberOfAttendedLesson);
}
