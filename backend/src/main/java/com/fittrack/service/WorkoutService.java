package com.fittrack.service;

import com.fittrack.entity.Workout;
import com.fittrack.repository.WorkoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkoutService {

    @Autowired
    private WorkoutRepository workoutRepository;

    public Workout addWorkout(String userId, Workout workout) {
        if (workout.getName() == null || workout.getName().trim().isEmpty() || workout.getDuration() == null) {
            throw new IllegalArgumentException("Workout name and duration are required");
        }

        if (workout.getDuration() <= 0 || workout.getDuration() > 1440) {
            throw new IllegalArgumentException("Duration must be greater than 0 and less than 1440 minutes");
        }

        workout.setId(null);
        workout.setUserId(userId);
        return workoutRepository.save(workout);
    }

    public List<Workout> getWorkoutsByUserId(String userId) {
        return workoutRepository.findByUserIdOrderByDateDesc(userId);
    }
}
