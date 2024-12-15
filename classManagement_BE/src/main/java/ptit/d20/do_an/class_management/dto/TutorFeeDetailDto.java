package ptit.d20.do_an.class_management.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class TutorFeeDetailDto {
    private String studentName;
    private String lastName;
    private String email;
    private String phone;
    private Integer numberOfClassesAttended;
    private Integer totalNumberOfClasses;
    private Long feeAmount;
    private Long feeSubmitted;
    private Long feeNotSubmitted;
    private Instant time;
    private Long id;
    private Integer year;
    private Integer month;
    private Integer lessonPrice;
}
