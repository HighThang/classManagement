package ptit.d20.do_an.class_management.dto;

import lombok.Data;
import ptit.d20.do_an.class_management.enumeration.ClassPeriod;

@Data
public class ClassPeriodInWeek {
    private ClassPeriod classPeriod;
    private String mondayClass;
    private String tuesdayClass;
    private String wednesdayClass;
    private String thursdayClass;
    private String fridayClass;
    private String saturdayClass;
    private String sundayClass;
}
