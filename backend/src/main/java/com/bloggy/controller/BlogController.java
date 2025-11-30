package com.bloggy.controller;

import com.bloggy.model.Blog;
import com.bloggy.model.Status;
import com.bloggy.repository.BlogRepository;
import com.bloggy.service.BlogProcessingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    @Autowired
    private BlogRepository blogRepo;

    @Autowired 
    private BlogProcessingService processingService;

    @PostMapping
    public Blog submitBlog(@RequestBody Blog blog) {
        blog.setStatus(Status.PENDING);
        Blog savedBlog = blogRepo.save(blog);
        processingService.processBlog(savedBlog);
        return blogRepo.save(blog);
    }

    @GetMapping
    public List<Blog> getAllBlogs() {
        return blogRepo.findAll();
    }

    @GetMapping(params = "status")
    public List<Blog> getBlogsByStatus(@RequestParam Status status) {
        return blogRepo.findAllByStatus(status);
    }

    @GetMapping("/{id}")
    public Blog getBlogById(@PathVariable Long id) {
        return blogRepo.findById(id).orElseThrow();
    }

    @PutMapping("/{id}/approve")
    public Blog approveBlog(@PathVariable Long id) {
        Blog blog = blogRepo.findById(id).orElseThrow();
        blog.setStatus(Status.APPROVED);
        return blogRepo.save(blog);
    }

    @PutMapping("/{id}/reject")
    public Blog rejectBlog(@PathVariable Long id) {
        Blog blog = blogRepo.findById(id).orElseThrow();
        blog.setStatus(Status.REJECTED);
        return blogRepo.save(blog);
    }

    @PutMapping("/{id}/review")
    public Blog putUnderReview(@PathVariable Long id) {
        Blog blog = blogRepo.findById(id).orElseThrow();
        blog.setStatus(Status.REVIEW);
        return blogRepo.save(blog);
    }

    @GetMapping(params = "author")
    public List<Blog> getBlogsByAuthor(@RequestParam String author) {
        return blogRepo.findByAuthor(author);
    }
}