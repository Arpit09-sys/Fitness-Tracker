package com.fittrack.service;

import com.fittrack.entity.Progress;
import com.fittrack.entity.User;
import com.fittrack.repository.ProgressRepository;
import com.fittrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProgressRepository progressRepository;

    public Map<String, Object> getDashboardData(String userId) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            return null;
        }

        User user = optionalUser.get();

        Double bmi = calculateBmi(user.getHeight(), user.getWeight());
        String bmiCategory = determineBmiCategory(bmi);
        Integer bmr = calculateBmr(user.getHeight(), user.getWeight(), user.getAge(), user.getGender());
        Integer dailyCalories = calculateDailyCalories(bmr, user.getActivityLevel());
        Integer waterGoal = calculateWaterGoal(user.getWeight());

        List<Progress> recentProgress = progressRepository.findTop5ByUserIdOrderByDateDesc(userId);

        Map<String, Object> userData = new HashMap<>();
        userData.put("name", user.getName());
        userData.put("weight", user.getWeight());
        userData.put("height", user.getHeight());
        userData.put("age", user.getAge());
        userData.put("gender", user.getGender());
        userData.put("activityLevel", user.getActivityLevel());
        userData.put("goal", user.getGoal());

        Map<String, Object> dashboardData = new HashMap<>();
        dashboardData.put("user", userData);
        dashboardData.put("bmi", bmi);
        dashboardData.put("bmiCategory", bmiCategory);
        dashboardData.put("bmr", bmr);
        dashboardData.put("dailyCalories", dailyCalories);
        dashboardData.put("waterGoal", waterGoal);
        dashboardData.put("recentProgress", recentProgress);

        return dashboardData;
    }

    private Double calculateBmi(Double height, Double weight) {
        if (height == null || weight == null || height <= 0) {
            return null;
        }
        double heightInMeters = height / 100.0;
        double rawBmi = weight / (heightInMeters * heightInMeters);
        return Math.round(rawBmi * 10.0) / 10.0;
    }

    private String determineBmiCategory(Double bmi) {
        if (bmi == null) {
            return "";
        }
        if (bmi < 18.5) {
            return "Underweight";
        } else if (bmi < 25.0) {
            return "Normal";
        } else if (bmi < 30.0) {
            return "Overweight";
        } else {
            return "Obese";
        }
    }

    private Integer calculateBmr(Double height, Double weight, Integer age, String gender) {
        if (height == null || weight == null || age == null || gender == null) {
            return null;
        }
        Double bmrValue = null;
        if ("Male".equalsIgnoreCase(gender)) {
            bmrValue = 10 * weight + 6.25 * height - 5 * age + 5;
        } else if ("Female".equalsIgnoreCase(gender)) {
            bmrValue = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        return bmrValue != null ? (int) Math.round(bmrValue) : null;
    }

    private Integer calculateDailyCalories(Integer bmr, String activityLevel) {
        if (bmr == null) {
            return null;
        }
        double multiplier = 1.2; // default sedentary
        if ("light".equalsIgnoreCase(activityLevel)) {
            multiplier = 1.375;
        } else if ("moderate".equalsIgnoreCase(activityLevel)) {
            multiplier = 1.55;
        } else if ("active".equalsIgnoreCase(activityLevel)) {
            multiplier = 1.725;
        }
        return (int) Math.round(bmr * multiplier);
    }

    private Integer calculateWaterGoal(Double weight) {
        if (weight == null) {
            return null;
        }
        return (int) Math.round(weight * 35);
    }
}
