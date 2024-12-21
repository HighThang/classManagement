package ptit.d20.do_an.class_management.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ptit.d20.do_an.class_management.enumeration.ClassPeriod;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AllScheduleDto {
    private LocalDate day;
    private ClassPeriod periodInDay;
    private String className;
}
