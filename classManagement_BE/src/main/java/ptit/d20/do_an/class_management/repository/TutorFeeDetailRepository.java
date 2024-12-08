package ptit.d20.do_an.class_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import ptit.d20.do_an.class_management.domain.TutorFeeDetail;

@Repository
public interface TutorFeeDetailRepository extends JpaRepository<TutorFeeDetail, Long>, JpaSpecificationExecutor<TutorFeeDetail> {
}
