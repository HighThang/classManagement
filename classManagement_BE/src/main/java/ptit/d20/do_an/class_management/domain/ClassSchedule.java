package ptit.d20.do_an.class_management.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ptit.d20.do_an.class_management.enumeration.ClassPeriod;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "class_schedule")
public class ClassSchedule extends BaseEntity {
    private LocalDate day;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ClassPeriod periodInDay; // ca hoc trong ngay

    private String dayInWeek; // MON, TUE, ...

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "classroom_id")
    private Classroom classroom;

    @JsonIgnore
    @OneToMany(mappedBy = "classSchedule", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<ClassAttendance> classAttendances;
}
