package ptit.d20.do_an.class_management.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class NewExamRequest {
    @NotNull
    @NotBlank
    private String examName;

    @NotNull
    private Long classId;
}
