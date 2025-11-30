package com.bloggy.controller;

import com.bloggy.model.Follow;
import com.bloggy.model.User;
import com.bloggy.repository.FollowRepository;
import com.bloggy.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/follow")
public class FollowController {

    @Autowired
    private FollowRepository followRepo;

    @Autowired
    private UserRepository userRepo;

    @PostMapping
    public ResponseEntity<?> followAuthor(@RequestBody Map<String, Object> request) {
        Long userId = ((Number) request.get("userId")).longValue();
        String authorName = (String) request.get("authorName");

        User user = userRepo.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        if (followRepo.existsByFollowerAndAuthorName(user, authorName)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Already following"));
        }

        Follow follow = new Follow();
        follow.setFollower(user);
        follow.setAuthorName(authorName);
        followRepo.save(follow);

        return ResponseEntity.ok(Map.of("message", "Now following " + authorName));
    }

    @DeleteMapping
    @Transactional
    public ResponseEntity<?> unfollowAuthor(@RequestBody Map<String, Object> request) {
        Long userId = ((Number) request.get("userId")).longValue();
        String authorName = (String) request.get("authorName");

        User user = userRepo.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        followRepo.deleteByFollowerAndAuthorName(user, authorName);
        return ResponseEntity.ok(Map.of("message", "Unfollowed " + authorName));
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkFollowing(
            @RequestParam Long userId,
            @RequestParam String authorName) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.ok(Map.of("isFollowing", false));
        }
        boolean isFollowing = followRepo.existsByFollowerAndAuthorName(user, authorName);
        return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
    }

    @GetMapping("/count/{authorName}")
    public ResponseEntity<?> getFollowerCount(@PathVariable String authorName) {
        long count = followRepo.countByAuthorName(authorName);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/following/{userId}")
    public ResponseEntity<?> getFollowing(@PathVariable Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        List<String> following = followRepo.findByFollower(user)
            .stream()
            .map(Follow::getAuthorName)
            .collect(Collectors.toList());
        return ResponseEntity.ok(following);
    }
}

