package ptit.d20.do_an.class_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
public class AvailableTeachersDto {
    private String basicInfo;
    private Map<String, String> additionalInfo;
}
