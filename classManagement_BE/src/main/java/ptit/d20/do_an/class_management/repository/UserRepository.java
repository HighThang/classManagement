package ptit.d20.do_an.class_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ptit.d20.do_an.class_management.domain.User;
import ptit.d20.do_an.class_management.enumeration.RoleName;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Optional<User> findByUsername(String userName);

    Optional<User> findFirstByEmail(String email);

    List<User> findAllByEmailIn(List<String> emails);

//    List<User> findByRoleNameAndActiveFalse(RoleName teacher);

//    List<User> findByRoleName(RoleName student);

    List<User> findByRoleNameAndActiveAndDeleted(RoleName roleName, boolean active, boolean deleted);

//    List<User> findByRoleNameAndActiveOrDeleted(RoleName roleName, boolean active, boolean deleted);

    Optional<User> findByIdAndRoleName(Long idTeacher, RoleName teacher);
}
