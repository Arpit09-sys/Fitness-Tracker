package com.fittrack.controller;

import com.fittrack.entity.Progress;
import com.fittrack.service.ProgressService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    @Autowired
    private ProgressService progressService;

    // POST /api/progress - Add new progress entry
    @PostMapping
    public ResponseEntity<?> addProgress(@RequestBody Progress progress, HttpSession session) {
        String userId = (String) session.getAttribute("userId");
        if (userId == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Not authorized, please log in");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        try {
            Progress savedProgress = progressService.addProgress(userId, progress);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", savedProgress);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // GET /api/progress - Get all progress entries for current user
    @GetMapping
    public ResponseEntity<?> getProgress(HttpSession session) {
        String userId = (String) session.getAttribute("userId");
        if (userId == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Not authorized, please log in");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        List<Progress> progressList = progressService.getProgressByUserId(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", progressList.size());
        response.put("data", progressList);

        return ResponseEntity.ok(response);
    }

    // PUT /api/progress/{id} - Update progress entry
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProgress(@PathVariable String id, @RequestBody Progress updatedData, HttpSession session) {
        String userId = (String) session.getAttribute("userId");
        if (userId == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Not authorized, please log in");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        try {
            Progress savedProgress = progressService.updateProgress(userId, id, updatedData);
            if (savedProgress == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Progress entry not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", savedProgress);

            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // DELETE /api/progress/{id} - Delete progress entry
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProgress(@PathVariable String id, HttpSession session) {
        String userId = (String) session.getAttribute("userId");
        if (userId == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Not authorized, please log in");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        try {
            boolean deleted = progressService.deleteProgress(userId, id);
            if (!deleted) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Progress entry not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", Collections.emptyMap());

            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
    }
}
