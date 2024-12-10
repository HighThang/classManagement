package ptit.d20.do_an.class_management.domain;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Getter
@Setter
@Entity
@Table(name = "email_code")
public class EmailCode {
    @Id
    private String email;
    private String code;
}
