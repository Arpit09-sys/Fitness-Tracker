package com.fittrack.controller;

import com.fittrack.entity.Workout;
import com.fittrack.service.WorkoutService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workout")
public class WorkoutController {

    @Autowired
    private WorkoutService workoutService;

    // POST /api/workout - Add a workout
    @PostMapping
    public ResponseEntity<?> addWorkout(@RequestBody Workout workout, HttpSession session) {
        String userId = (String) session.getAttribute("userId");
        if (userId == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Not authorized, please log in");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        try {
            Workout savedWorkout = workoutService.addWorkout(userId, workout);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", savedWorkout);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // GET /api/workout - Get all workouts for current user
    @GetMapping
    public ResponseEntity<?> getWorkouts(HttpSession session) {
        String userId = (String) session.getAttribute("userId");
        if (userId == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Not authorized, please log in");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        List<Workout> workouts = workoutService.getWorkoutsByUserId(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", workouts.size());
        response.put("data", workouts);

        return ResponseEntity.ok(response);
    }
}
