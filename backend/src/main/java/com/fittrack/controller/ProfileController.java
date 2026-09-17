package com.fittrack.controller;

import com.fittrack.model.User;
import com.fittrack.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    // GET /api/profile - Get user profile
    @GetMapping
    public ResponseEntity<?> getProfile(HttpSession session) {
        String userId = (String) session.getAttribute("userId");
        if (userId == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Not authorized, please log in");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        User user = optionalUser.get();
        user.setPassword(null); // Never expose password in response

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", user);

        return ResponseEntity.ok(response);
    }

    // PUT /api/profile - Update user profile
    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody User updatedData, HttpSession session) {
        String userId = (String) session.getAttribute("userId");
        if (userId == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Not authorized, please log in");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        User user = optionalUser.get();

        if (updatedData.getAge() != null && (updatedData.getAge() < 1 || updatedData.getAge() > 120)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Age must be between 1 and 120");
            return ResponseEntity.badRequest().body(response);
        }

        if (updatedData.getHeight() != null && (updatedData.getHeight() <= 0 || updatedData.getHeight() > 300)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Height must be greater than 0");
            return ResponseEntity.badRequest().body(response);
        }

        if (updatedData.getWeight() != null && (updatedData.getWeight() <= 0 || updatedData.getWeight() > 500)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Weight must be greater than 0");
            return ResponseEntity.badRequest().body(response);
        }

        if (updatedData.getName() != null) user.setName(updatedData.getName());
        if (updatedData.getAge() != null) user.setAge(updatedData.getAge());
        if (updatedData.getGender() != null) user.setGender(updatedData.getGender());
        if (updatedData.getHeight() != null) user.setHeight(updatedData.getHeight());
        if (updatedData.getWeight() != null) user.setWeight(updatedData.getWeight());
        if (updatedData.getActivityLevel() != null) user.setActivityLevel(updatedData.getActivityLevel());
        if (updatedData.getGoal() != null) user.setGoal(updatedData.getGoal());

        User savedUser = userRepository.save(user);
        savedUser.setPassword(null);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", savedUser);

        return ResponseEntity.ok(response);
    }
}
