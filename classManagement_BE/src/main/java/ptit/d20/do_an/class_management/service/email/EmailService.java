package ptit.d20.do_an.class_management.service.email;

import ptit.d20.do_an.class_management.dto.EmailDetail;

public interface EmailService {
    String sendSimpleEmail(EmailDetail detail);
}
