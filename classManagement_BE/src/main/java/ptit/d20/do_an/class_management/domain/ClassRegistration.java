package ptit.d20.do_an.class_management.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Objects;

@Builder(builderMethodName = "newBuilder")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "class_registration")
public class ClassRegistration extends BaseEntity {
    @Column(name = "first_name")
    private String firstName;

    @Column(name = "surname")
    private String surname;

    @Column(name = "last_name")
    private String lastName;

    private String email;

    private String phone;

    private String address;

    @Column(name = "registration_date")
    private Instant registrationDate;

    private String note;

    @Column(name = "email_confirmed")
    private Boolean emailConfirmed = false;

    private Date dob;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "classroom_id")
    private Classroom classroom;

    @JsonIgnore
    @OneToMany(mappedBy = "classRegistration", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<TutorFeeDetail> tutorFeeDetails;

    private String imgURLRequest;
    private Boolean active;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ClassRegistration that = (ClassRegistration) o;
        return Objects.equals(firstName, that.firstName) &&
                Objects.equals(surname, that.surname) &&
                Objects.equals(lastName, that.lastName) &&
                Objects.equals(email, that.email) &&
                Objects.equals(phone, that.phone) &&
                Objects.equals(address, that.address) &&
                Objects.equals(registrationDate, that.registrationDate) &&
                Objects.equals(note, that.note) &&
                Objects.equals(emailConfirmed, that.emailConfirmed);
    }

    @Override
    public int hashCode() {
        return Objects.hash(firstName, surname, lastName, email, phone, address, registrationDate, note, emailConfirmed);
    }
}
