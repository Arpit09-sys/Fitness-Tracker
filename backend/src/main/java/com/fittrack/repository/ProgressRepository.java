package com.fittrack.repository;

import com.fittrack.entity.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, String> {
    List<Progress> findByUserIdOrderByDateDesc(String userId);
    List<Progress> findTop5ByUserIdOrderByDateDesc(String userId);
}
