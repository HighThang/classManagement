package ptit.d20.do_an.class_management.domain;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.NaturalId;
import ptit.d20.do_an.class_management.enumeration.RoleName;

import javax.persistence.*;

@Getter
@Setter
@Entity
@Table(name = "roles")
public class Role extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @NaturalId
    @Column(length = 10)
    private RoleName name;

    public Role() {

    }

    public Role(RoleName name) {
        this.name = name;
    }
}
