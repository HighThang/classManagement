package ptit.d20.do_an.class_management.dto;

import lombok.Data;

@Data
public class ExamScoreDto {
    private Long id;
    private String name;
    private String email;
    private String dob;
    private Double score;
}
