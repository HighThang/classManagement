package ptit.d20.do_an.class_management.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "sub_name", nullable = false, length = 100)
    private String subName;

    @Column(name = "id_teacher", nullable = false)
    private Long idTeacher;

    @Column(name = "active", nullable = false)
    private Integer active = 0; // Default value 1 (active)

    @Column(name = "deleted", nullable = false)
    private Integer deleted = 0; // Default value 0 (not deleted)
}