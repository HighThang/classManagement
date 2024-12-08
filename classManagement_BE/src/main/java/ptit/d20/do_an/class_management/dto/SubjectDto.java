package ptit.d20.do_an.class_management.dto;

import lombok.Data;
import ptit.d20.do_an.class_management.domain.Subject;

@Data
public class SubjectDto {
    private Integer id;
    private String subName;
    private String teacherName; // Thêm trường teacherName
    private int active;
    private int deleted;

    // Constructor
    public SubjectDto(Subject subject, String teacherName) {
        this.id = subject.getId();
        this.subName = subject.getSubName();
        this.teacherName = teacherName; // Gán tên giáo viên
        this.active = subject.getActive();
        this.deleted = subject.getDeleted();
    }
}