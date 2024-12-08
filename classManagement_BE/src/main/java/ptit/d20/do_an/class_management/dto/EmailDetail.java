package ptit.d20.do_an.class_management.dto;

import lombok.Data;

@Data
public class EmailDetail {
    private String recipient;
    private String msgBody;
    private String subject;
    private String attachment;
}
