package ptit.d20.do_an.class_management.dto.classroom;

import lombok.Data;

@Data
public class NewClassRequest {
    private String className;
    private String subjectName;
    private String note;
}
