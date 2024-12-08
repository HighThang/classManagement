package ptit.d20.do_an.class_management.dto;

import lombok.Data;
import ptit.d20.do_an.class_management.enumeration.ClassPeriod;

import java.time.LocalDate;

@Data
public class NewClassScheduleRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private ClassPeriod periodInDay;
    private String dayInWeek;
    private Long classId;
}
