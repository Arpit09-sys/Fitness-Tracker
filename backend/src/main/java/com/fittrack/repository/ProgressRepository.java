package com.fittrack.repository;

import com.fittrack.model.Progress;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProgressRepository extends MongoRepository<Progress, String> {
    List<Progress> findByUserIdOrderByDateDesc(String userId);
    List<Progress> findTop5ByUserIdOrderByDateDesc(String userId);
}
