package com.fittrack.controller;

import com.fittrack.model.Progress;
import com.fittrack.model.User;
import com.fittrack.repository.ProgressRepository;
import com.fittrack.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProgressRepository progressRepository;

    // GET /api/dashboard - Get dashboard calculations and recent progress
    @GetMapping
    public ResponseEntity<?> getDashboard(HttpSession session) {
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

        // 1. Calculate BMI
        Double bmi = null;
        String bmiCategory = "";
        if (user.getHeight() != null && user.getWeight() != null && user.getHeight() > 0) {
            double heightInMeters = user.getHeight() / 100.0;
            double rawBmi = user.getWeight() / (heightInMeters * heightInMeters);
            bmi = Math.round(rawBmi * 10.0) / 10.0; // round to 1 decimal place

            if (bmi < 18.5) {
                bmiCategory = "Underweight";
            } else if (bmi < 25.0) {
                bmiCategory = "Normal";
            } else if (bmi < 30.0) {
                bmiCategory = "Overweight";
            } else {
                bmiCategory = "Obese";
            }
        }

        // 2. Calculate BMR using Mifflin-St Jeor equation and Daily Calories
        Integer bmr = null;
        Integer dailyCalories = null;
        if (user.getHeight() != null && user.getWeight() != null && user.getAge() != null && user.getGender() != null) {
            Double bmrValue = null;
            if ("Male".equalsIgnoreCase(user.getGender())) {
                bmrValue = 10 * user.getWeight() + 6.25 * user.getHeight() - 5 * user.getAge() + 5;
            } else if ("Female".equalsIgnoreCase(user.getGender())) {
                bmrValue = 10 * user.getWeight() + 6.25 * user.getHeight() - 5 * user.getAge() - 161;
            }

            if (bmrValue != null) {
                bmr = (int) Math.round(bmrValue);

                // Activity level multiplier
                double multiplier = 1.2; // default sedentary
                if ("light".equalsIgnoreCase(user.getActivityLevel())) {
                    multiplier = 1.375;
                } else if ("moderate".equalsIgnoreCase(user.getActivityLevel())) {
                    multiplier = 1.55;
                } else if ("active".equalsIgnoreCase(user.getActivityLevel())) {
                    multiplier = 1.725;
                }

                dailyCalories = (int) Math.round(bmr * multiplier);
            }
        }

        // 3. Calculate Daily Water Goal (weight in kg * 35 ml)
        Integer waterGoal = null;
        if (user.getWeight() != null) {
            waterGoal = (int) Math.round(user.getWeight() * 35);
        }

        // 4. Get recent 5 progress records
        List<Progress> recentProgress = progressRepository.findTop5ByUserIdOrderByDateDesc(userId);

        // 5. Build user profile summary
        Map<String, Object> userData = new HashMap<>();
        userData.put("name", user.getName());
        userData.put("weight", user.getWeight());
        userData.put("height", user.getHeight());
        userData.put("age", user.getAge());
        userData.put("gender", user.getGender());
        userData.put("activityLevel", user.getActivityLevel());
        userData.put("goal", user.getGoal());

        // 6. Build dashboard response
        Map<String, Object> dashboardData = new HashMap<>();
        dashboardData.put("user", userData);
        dashboardData.put("bmi", bmi);
        dashboardData.put("bmiCategory", bmiCategory);
        dashboardData.put("bmr", bmr);
        dashboardData.put("dailyCalories", dailyCalories);
        dashboardData.put("waterGoal", waterGoal);
        dashboardData.put("recentProgress", recentProgress);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", dashboardData);

        return ResponseEntity.ok(response);
    }
}
