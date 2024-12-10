package ptit.d20.do_an.class_management.dto.security;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.Valid;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SignUpRequest {
    @NotBlank(message = "username must not be empty!")
    private String username;

    @Email
    @NotBlank(message = "email must not be empty!")
    @Size(max = 40)
    @Email
    private String email;

    @NotBlank(message = "password length must be greater 6!")
    @Size(min = 6)
    private String password;

    private String firstName;
    private String surname;
    private String lastName;
    private String phone;
    private Date dob;
    private String address;
    private String business;
}
