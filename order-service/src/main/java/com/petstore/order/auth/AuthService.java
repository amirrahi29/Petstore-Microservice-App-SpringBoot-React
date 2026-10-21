package com.petstore.order.auth;

import com.petstore.order.common.ConflictException;
import com.petstore.order.common.UnauthorizedException;
import com.petstore.order.security.JwtService;
import com.petstore.order.user.RoleRepository;
import com.petstore.order.user.UserAccount;
import com.petstore.order.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository users;
    private final RoleRepository roles;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository users,
            RoleRepository roles,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.users = users;
        this.roles = roles;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (users.existsByUsername(request.getUsername().trim())) {
            throw new ConflictException("Username already exists");
        }
        UserAccount user = new UserAccount();
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(roles.findByName("USER").orElseThrow(() -> new IllegalStateException("USER role is missing")));
        users.save(user);
        return tokenFor(user);
    }

    public AuthResponse login(LoginRequest request) {
        UserAccount user = users.findByUsername(request.getUsername().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid username or password");
        }
        return tokenFor(user);
    }

    private AuthResponse tokenFor(UserAccount user) {
        return new AuthResponse(jwtService.generate(user), user.getUsername(), user.getRole().getName());
    }
}
