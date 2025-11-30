package com.bloggy.config;

import com.bloggy.model.User;
import com.bloggy.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepo;

    @Override
    public void run(String... args) {
        // Create admin user if not exists
        if (!userRepo.existsByEmail("admin@bloggy.com")) {
            User admin = new User();
            admin.setEmail("admin@bloggy.com");
            admin.setPassword("password");
            admin.setName("Admin");
            admin.setRole("ADMIN");
            userRepo.save(admin);
            System.out.println("✅ Admin user created: admin@bloggy.com / password");
        }
    }
}

