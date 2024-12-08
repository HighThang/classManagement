package ptit.d20.do_an.class_management.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import ptit.d20.do_an.class_management.domain.User;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class UserDetailDto {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String firstName;
    private String surname;
    private String lastName;
    private LocalDate dob;
    private String accountType;
    private String role;
    private String business;
    private String imageURL;
    private String address;

    private Boolean active;
    private Boolean deleted;

    public UserDetailDto(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email= user.getEmail();
        this.phone = user.getPhone();
        this.firstName = user.getFirstName();
        this.surname= user.getSurname();
        this.lastName = user.getLastName();
        this.dob = user.getDob();
        this.accountType = user.getRole().getName().toString();
        this.role = user.getRole().getName().toString();
        this.business = user.getBusiness();
        this.imageURL = user.getImageURL();
        this.address = user.getAddress();
        this.active = user.getActive();
        this.deleted = user.getDeleted();
    }

    public UserDetailDto(Long id, String username, String email, String firstName, String lastName, String phone, LocalDate dob, String business, String imageURL, String address, Boolean active, Boolean deleted) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dob = dob;
        this.business = business;
        this.imageURL = imageURL;
        this.address = address;
        this.active = active;
        this.deleted = deleted;
    }
}
