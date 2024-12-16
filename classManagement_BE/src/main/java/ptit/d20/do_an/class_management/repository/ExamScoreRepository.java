package ptit.d20.do_an.class_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ptit.d20.do_an.class_management.domain.ClassAttendance;
import ptit.d20.do_an.class_management.domain.ExamScore;

import java.util.List;

@Repository
public interface ExamScoreRepository extends JpaRepository<ExamScore, Long> {
    List<ExamScore> findAllByIdIn(List<Long> examScoreIds);

    @Modifying
    @Query("DELETE FROM ExamScore tfd WHERE tfd.classRegistration.id = :studentId")
    void deleteAllByClassRegistrationId(@Param("studentId") Long studentId);
}
