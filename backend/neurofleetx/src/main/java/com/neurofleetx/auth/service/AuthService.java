package com.neurofleetx.auth.service;

import com.neurofleetx.auth.dto.*;
import com.neurofleetx.auth.entity.User;
import com.neurofleetx.auth.entity.UserStatus;
import com.neurofleetx.auth.repository.UserRepository;
import com.neurofleetx.auth.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email)) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.name);
        user.setPhone(request.phone);
        user.setEmail(request.email);
        user.setPassword(passwordEncoder.encode(request.password));
        user.setRole(request.role);
        if (request.role == com.neurofleetx.auth.entity.Role.CUSTOMER) {
            user.setStatus(UserStatus.APPROVED);
        } else {
            // Auto-approve everyone for testing
            user.setStatus(UserStatus.APPROVED);
        }

        userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (user.getStatus() == UserStatus.PENDING) {
            throw new RuntimeException("Account is pending approval");
        }
        if (user.getStatus() == UserStatus.REJECTED) {
            throw new RuntimeException("Account has been rejected");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getRole().name());
    }
}
