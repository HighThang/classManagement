package ptit.d20.do_an.class_management.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import ptit.d20.do_an.class_management.exception.ResourceNotFoundException;
import ptit.d20.do_an.class_management.domain.User;
import ptit.d20.do_an.class_management.repository.UserRepository;

import javax.transaction.Transactional;

@Service
public class CustomerUserDetailService implements UserDetailsService {
    private final UserRepository userRepository;

    @Autowired
    public CustomerUserDetailService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String userName)
            throws UsernameNotFoundException {
        User user = userRepository.findByUsername(userName)
                .filter(User::getActive)
                .stream().findFirst()
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + userName));
//todo return user not active?
        return UserPrincipal.create(user);
    }

    @Transactional
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Not found user with id = " + id)
        );

        return UserPrincipal.create(user);
    }
}
