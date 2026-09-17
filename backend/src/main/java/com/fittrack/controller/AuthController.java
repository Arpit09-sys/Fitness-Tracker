package com.fittrack.controller;

import com.fittrack.model.User;
import com.fittrack.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // POST /api/auth/signup - Register new user
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user, HttpSession session) {
        // Validation
        if (user.getName() == null || user.getName().trim().isEmpty() ||
            user.getEmail() == null || user.getEmail().trim().isEmpty() ||
            user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Please provide name, email and password");
            return ResponseEntity.badRequest().body(response);
        }

        if (user.getPassword().length() < 6) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Password must be at least 6 characters");
            return ResponseEntity.badRequest().body(response);
        }

        String email = user.getEmail().toLowerCase().trim();
        user.setEmail(email);

        // Check if user already exists
        if (userRepository.existsByEmail(email)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "User already exists with this email");
            return ResponseEntity.badRequest().body(response);
        }

        // Hash password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Save user to MongoDB
        User savedUser = userRepository.save(user);

        // Store user ID in session
        session.setAttribute("userId", savedUser.getId());

        // Prepare response
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", savedUser.getId());
        userData.put("name", savedUser.getName());
        userData.put("email", savedUser.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", userData);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // POST /api/auth/login - Login user
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, HttpSession session) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null || email.trim().isEmpty() || password.trim().isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Please provide email and password");
            return ResponseEntity.badRequest().body(response);
        }

        email = email.toLowerCase().trim();

        // Find user by email
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        User user = optionalUser.get();

        // Check password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // Store user ID in session
        session.setAttribute("userId", user.getId());

        // Prepare response
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", userData);

        return ResponseEntity.ok(response);
    }

    // POST /api/auth/logout - Logout user
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }
}
