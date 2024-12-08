package ptit.d20.do_an.class_management.dto;

import lombok.Data;
import ptit.d20.do_an.class_management.enumeration.ClassPeriod;

import java.time.LocalDate;

@Data
public class StudentAttendanceResultDto {
    private LocalDate day;
    private ClassPeriod classPeriod;
    private Boolean attended;
}
