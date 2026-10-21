package com.petstore.order.config;

import com.petstore.order.user.Role;
import com.petstore.order.user.RoleRepository;
import com.petstore.order.user.UserAccount;
import com.petstore.order.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final RoleRepository roles;
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(RoleRepository roles, UserRepository users, PasswordEncoder passwordEncoder) {
        this.roles = roles;
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        Role userRole = roles.findByName("USER").orElseGet(() -> saveRole("USER"));
        Role adminRole = roles.findByName("ADMIN").orElseGet(() -> saveRole("ADMIN"));
        if (users.findByUsername("demo").isEmpty()) {
            saveUser("demo", "demo@petstore.local", "demo123", userRole);
        }
        if (users.findByUsername("admin").isEmpty()) {
            saveUser("admin", "admin@petstore.local", "admin123", adminRole);
            log.info("Created default admin account");
        }
    }

    private Role saveRole(String name) {
        Role role = new Role();
        role.setName(name);
        return roles.save(role);
    }

    private void saveUser(String username, String email, String password, Role role) {
        UserAccount user = new UserAccount();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        users.save(user);
    }
}
