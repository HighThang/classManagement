package ptit.d20.do_an.class_management.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ActiveAccountRequest {
    private String email;
    private String code;
}
