package com.fittrack.service;

import com.fittrack.entity.Progress;
import com.fittrack.repository.ProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProgressService {

    @Autowired
    private ProgressRepository progressRepository;

    public Progress addProgress(String userId, Progress progress) {
        if (progress.getWeight() == null) {
            throw new IllegalArgumentException("Weight must be greater than 0");
        }
        validateProgressInput(progress.getWeight(), progress.getWaterIntake());

        progress.setId(null);
        progress.setUserId(userId);
        return progressRepository.save(progress);
    }

    public List<Progress> getProgressByUserId(String userId) {
        return progressRepository.findByUserIdOrderByDateDesc(userId);
    }

    public Progress updateProgress(String userId, String id, Progress updatedData) {
        Optional<Progress> optionalProgress = progressRepository.findById(id);
        if (optionalProgress.isEmpty()) {
            return null;
        }

        Progress progress = optionalProgress.get();
        if (!userId.equals(progress.getUserId())) {
            throw new SecurityException("Not authorized to update this entry");
        }

        validateProgressInput(updatedData.getWeight(), updatedData.getWaterIntake());

        if (updatedData.getWeight() != null) progress.setWeight(updatedData.getWeight());
        if (updatedData.getDate() != null) progress.setDate(updatedData.getDate());
        if (updatedData.getWorkoutCompleted() != null) progress.setWorkoutCompleted(updatedData.getWorkoutCompleted());
        if (updatedData.getWaterIntake() != null) progress.setWaterIntake(updatedData.getWaterIntake());
        if (updatedData.getNotes() != null) progress.setNotes(updatedData.getNotes());

        return progressRepository.save(progress);
    }

    public boolean deleteProgress(String userId, String id) {
        Optional<Progress> optionalProgress = progressRepository.findById(id);
        if (optionalProgress.isEmpty()) {
            return false;
        }

        Progress progress = optionalProgress.get();
        if (!userId.equals(progress.getUserId())) {
            throw new SecurityException("Not authorized to delete this entry");
        }

        progressRepository.delete(progress);
        return true;
    }

    private void validateProgressInput(Double weight, Integer waterIntake) {
        if (weight != null && (weight <= 0 || weight > 500)) {
            throw new IllegalArgumentException("Weight must be greater than 0");
        }
        if (waterIntake != null && waterIntake < 0) {
            throw new IllegalArgumentException("Water intake cannot be negative");
        }
    }
}
