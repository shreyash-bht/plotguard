package com.plotguard.api.login;

import com.plotguard.api.dto.NewUserDto;
import com.plotguard.api.entity.Role;
import com.plotguard.api.entity.User;
import com.plotguard.api.repository.RoleRepository;
import com.plotguard.api.repository.UserRepository;
import com.plotguard.api.security.JWTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/auth")
public class AuthAPI {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    private static final Integer ROLE_ADMIN_ID = 1;
    private static final Integer ROLE_MODERATOR_ID = 2;
    private static final Integer ROLE_USER_ID = 3;
    private static final String TOKEN_TYPE = "Bearer";

    @PostMapping("/register")
    public void addNewUser(@RequestBody NewUserDto newUserDto) {
        User newUser = User.builder()
                .username(newUserDto.getUsername())
                .emailId(newUserDto.getEmailId())
                .passwordHash(passwordEncoder.encode(newUserDto.getPassword()))
                .build();
        Optional<Role> roles = roleRepository.findById(ROLE_USER_ID);
        newUser.setRoles(Set.of(roles.get()));
        userRepository.save(newUser);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.getUserId(), request.getPassword()));
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUserId());
        return LoginResponse.builder()
                .tokenType(TOKEN_TYPE)
                .accessToken(jwtService.generateToken(userDetails))
                .build();
    }

//    @PostMapping("/auth/register/admin")
//    @PreAuthorize("hasRole('ADMIN')")
//    public void addAdminUser(@RequestBody NewUserDto newUserDto) {
//        User newUser = User.builder()
//                .username(newUserDto.getUsername())
//                .emailId(newUserDto.getEmailId())
//                .passwordHash(passwordEncoder.encode(newUserDto.getPassword()))
//                .build();
//        Optional<Role> roles = roleRepository.findById(ROLE_USER_ID);
//        newUser.setRoles(Set.of(roles.get()));
//        userRepository.save(newUser);
//    }

    @GetMapping("/register/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String addAdminUser() {
        return "adminHello";
    }
}
