package ptit.d20.do_an.class_management.dto;

import lombok.Data;

import java.util.Date;

@Data
public class RequestRegistrationDto {
    private String firstName;
    private String surName;
    private String lastName;
    private String email;
    private Date dob;
    private String phone;
    private String address;
    private String subName;
    private Long idClassroom;
    private Long idStudent;
    private String imgUrlRequest;
}
