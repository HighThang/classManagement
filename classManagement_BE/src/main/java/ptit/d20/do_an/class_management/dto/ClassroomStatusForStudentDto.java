package ptit.d20.do_an.class_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import ptit.d20.do_an.class_management.domain.Classroom;

@Data
@AllArgsConstructor
public class ClassroomStatusForStudentDto {
    private Classroom classroom;
    private boolean active;
    private boolean deleted;
}
