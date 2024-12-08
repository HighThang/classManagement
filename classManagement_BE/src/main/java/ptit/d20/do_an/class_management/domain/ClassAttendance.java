package ptit.d20.do_an.class_management.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;

@EqualsAndHashCode(callSuper = false)
@Data
@Entity
@Table(name = "class_attendance")
public class ClassAttendance extends BaseEntity {
    @Column(name = "is_attended")
    private Boolean isAttended;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "schedule_id")
    private ClassSchedule classSchedule;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "class_registration_id")
    private ClassRegistration classRegistration;

}
