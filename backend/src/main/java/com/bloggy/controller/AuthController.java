package com.bloggy.controller;

import com.bloggy.model.User;
import com.bloggy.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepo;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String name = body.get("name");

        if (email == null || password == null || name == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing fields"));
        }

        if (userRepo.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(password); // In production: hash this!
        user.setName(name);
        user.setRole("USER");

        userRepo.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        User user = userRepo.findByEmail(email).orElse(null);

        if (user == null || !user.getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("bio", user.getBio());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        User user = userRepo.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("bio", user.getBio());
        response.put("role", user.getRole());
        response.put("createdAt", user.getCreatedAt());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/user/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = userRepo.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (body.containsKey("name") && body.get("name") != null) {
            user.setName(body.get("name"));
        }
        if (body.containsKey("bio")) {
            user.setBio(body.get("bio"));
        }
        if (body.containsKey("password") && body.get("password") != null && !body.get("password").isEmpty()) {
            user.setPassword(body.get("password")); // In production: hash this!
        }

        userRepo.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("bio", user.getBio());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }
}

