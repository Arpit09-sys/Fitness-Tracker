package com.fittrack.controller;

import com.fittrack.model.Workout;
import com.fittrack.repository.WorkoutRepository;
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
    private WorkoutRepository workoutRepository;

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

        if (workout.getName() == null || workout.getName().trim().isEmpty() || workout.getDuration() == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Workout name and duration are required");
            return ResponseEntity.badRequest().body(response);
        }

        if (workout.getDuration() <= 0 || workout.getDuration() > 1440) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Duration must be greater than 0 and less than 1440 minutes");
            return ResponseEntity.badRequest().body(response);
        }

        workout.setUserId(userId);
        Workout savedWorkout = workoutRepository.save(workout);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", savedWorkout);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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

        List<Workout> workouts = workoutRepository.findByUserIdOrderByDateDesc(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", workouts.size());
        response.put("data", workouts);

        return ResponseEntity.ok(response);
    }
}
