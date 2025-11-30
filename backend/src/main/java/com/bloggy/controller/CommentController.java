package com.bloggy.controller;

import com.bloggy.model.Blog;
import com.bloggy.model.Comment;
import com.bloggy.model.User;
import com.bloggy.repository.BlogRepository;
import com.bloggy.repository.CommentRepository;
import com.bloggy.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/blogs/{blogId}/comments")
public class CommentController {

    @Autowired
    private CommentRepository commentRepo;

    @Autowired
    private BlogRepository blogRepo;

    @Autowired
    private UserRepository userRepo;

    @GetMapping
    public List<Map<String, Object>> getComments(@PathVariable Long blogId) {
        List<Comment> comments = commentRepo.findByBlogIdOrderByCreatedAtDesc(blogId);
        
        return comments.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("content", c.getContent());
            map.put("author", c.getUser().getName());
            map.put("authorEmail", c.getUser().getEmail());
            map.put("createdAt", c.getCreatedAt());
            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> addComment(
            @PathVariable Long blogId,
            @RequestBody Map<String, Object> body) {
        
        String content = (String) body.get("content");
        Object userIdObj = body.get("userId");
        
        if (content == null || userIdObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing content or userId"));
        }
        
        Long userId = Long.valueOf(userIdObj.toString());

        Blog blog = blogRepo.findById(blogId).orElse(null);
        User user = userRepo.findById(userId).orElse(null);

        if (blog == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Blog not found"));
        }
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setBlog(blog);
        comment.setUser(user);

        commentRepo.save(comment);

        Map<String, Object> response = new HashMap<>();
        response.put("id", comment.getId());
        response.put("content", comment.getContent());
        response.put("author", user.getName());
        response.put("authorEmail", user.getEmail());
        response.put("createdAt", comment.getCreatedAt());

        return ResponseEntity.ok(response);
    }
}

