package com.fittrack.repository;

import com.fittrack.entity.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutRepository extends JpaRepository<Workout, String> {
    List<Workout> findByUserIdOrderByDateDesc(String userId);
}
