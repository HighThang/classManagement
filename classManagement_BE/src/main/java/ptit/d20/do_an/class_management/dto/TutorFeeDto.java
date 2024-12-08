package ptit.d20.do_an.class_management.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TutorFeeDto {
    private Integer year;
    private Integer month;
    private Long id;
    private Integer totalLesson;
    private Integer lessonPrice;
    private Long feeEstimate;
    private Long feeCollected;
    private Long feeNotCollected;
    private Instant createdDate;
}
