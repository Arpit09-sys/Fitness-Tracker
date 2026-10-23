package com.fittrack.service;

import com.fittrack.entity.User;
import com.fittrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        if (user.getName() == null || user.getName().trim().isEmpty() ||
            user.getEmail() == null || user.getEmail().trim().isEmpty() ||
            user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Please provide name, email and password");
        }

        if (user.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        String email = user.getEmail().toLowerCase().trim();
        user.setEmail(email);

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User already exists with this email");
        }

        validateMetrics(user.getAge(), user.getHeight(), user.getWeight());

        // Prevent client from choosing user ID
        user.setId(null);

        // Hash password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Save user to database
        return userRepository.save(user);
    }

    public Optional<User> authenticate(String email, String password) {
        if (email == null || password == null || email.trim().isEmpty() || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Please provide email and password");
        }

        String normalizedEmail = email.toLowerCase().trim();
        Optional<User> optionalUser = userRepository.findByEmail(normalizedEmail);
        if (optionalUser.isEmpty()) {
            return Optional.empty();
        }

        User user = optionalUser.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return Optional.empty();
        }

        return Optional.of(user);
    }

    public Optional<User> getUserById(String userId) {
        if (userId == null) {
            return Optional.empty();
        }
        return userRepository.findById(userId);
    }

    public User updateProfile(String userId, User updatedData) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            return null;
        }

        validateMetrics(updatedData.getAge(), updatedData.getHeight(), updatedData.getWeight());

        User user = optionalUser.get();
        if (updatedData.getName() != null) user.setName(updatedData.getName());
        if (updatedData.getAge() != null) user.setAge(updatedData.getAge());
        if (updatedData.getGender() != null) user.setGender(updatedData.getGender());
        if (updatedData.getHeight() != null) user.setHeight(updatedData.getHeight());
        if (updatedData.getWeight() != null) user.setWeight(updatedData.getWeight());
        if (updatedData.getActivityLevel() != null) user.setActivityLevel(updatedData.getActivityLevel());
        if (updatedData.getGoal() != null) user.setGoal(updatedData.getGoal());

        return userRepository.save(user);
    }

    private void validateMetrics(Integer age, Double height, Double weight) {
        if (age != null && (age < 1 || age > 120)) {
            throw new IllegalArgumentException("Age must be between 1 and 120");
        }
        if (height != null && (height <= 0 || height > 300)) {
            throw new IllegalArgumentException("Height must be greater than 0");
        }
        if (weight != null && (weight <= 0 || weight > 500)) {
            throw new IllegalArgumentException("Weight must be greater than 0");
        }
    }
}
