package com.bloggy.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.bloggy.model.Blog;
import com.bloggy.model.Status;
import com.bloggy.repository.BlogRepository;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Service
public class BlogProcessingService {

    @Autowired
    private BlogRepository blogRepo;

    @Autowired
    private TfIdfTagGenerator tagGenerator;

    @Autowired
    private EmailService emailService;

    // Common profane words (subset - add more as needed)
    private static final Set<String> PROFANE_WORDS = new HashSet<>(Arrays.asList(
        "fuck", "shit", "ass", "bitch", "damn", "crap", "bastard", "hell",
        "dick", "cock", "pussy", "cunt", "whore", "slut", "fag", "nigger",
        "asshole", "bullshit", "motherfucker", "fucker", "fucking", "shitty"
    ));

    @Async("workerExecutor")
    public void processBlog(Blog blog) {
        blog.setStatus(Status.PROCESSING);
        blogRepo.save(blog);

        // Check for profanity
        boolean hasProfanity = checkProfanity(blog.getTitle() + " " + blog.getContent());
        blog.setProfanityFound(hasProfanity);

        // Calculate SEO score
        double seoScore = calculateSeoScore(blog);
        blog.setSeoScore(seoScore);

        // AI similarity (random for now)
        blog.setAiSimilarityScore(Math.random());

        // Auto-generate tags using TF-IDF
        String tags = tagGenerator.generateTags(blog.getTitle(), blog.getContent(), 5);
        blog.setTags(tags);

        // Set status based on profanity
        if (hasProfanity) {
            blog.setStatus(Status.REVIEW);  // Needs human moderation
        } else {
            blog.setStatus(Status.APPROVED);  // Auto-approve if clean
            // Send email notifications to followers
            emailService.sendNewBlogNotification(blog);
        }

        blogRepo.save(blog);
    }

    private boolean checkProfanity(String text) {
        if (text == null) return false;
        String[] words = text.toLowerCase().replaceAll("[^a-zA-Z ]", "").split("\\s+");
        for (String word : words) {
            if (PROFANE_WORDS.contains(word)) {
                return true;
            }
        }
        return false;
    }

    private double calculateSeoScore(Blog blog) {
        double score = 0;
        String title = blog.getTitle() != null ? blog.getTitle() : "";
        String content = blog.getContent() != null ? blog.getContent() : "";

        // Title length (10%) - ideal 50-70 chars
        int titleLen = title.length();
        if (titleLen >= 50 && titleLen <= 70) {
            score += 10;
        } else if (titleLen >= 30 && titleLen <= 90) {
            score += 6;
        } else if (titleLen > 0) {
            score += 3;
        }

        // Content length (20%) - ideal 600-2000 words
        int wordCount = content.split("\\s+").length;
        if (wordCount >= 600 && wordCount <= 2000) {
            score += 20;
        } else if (wordCount >= 300 && wordCount <= 3000) {
            score += 12;
        } else if (wordCount >= 100) {
            score += 6;
        } else if (wordCount > 0) {
            score += 2;
        }

        // Headings presence (10%) - check for markdown headings
        if (content.contains("#") || content.contains("<h1") || content.contains("<h2")) {
            score += 10;
        } else if (content.length() > 500) {
            score += 3; // Longer content without headings gets partial credit
        }

        // Paragraph structure (10%)
        long paragraphs = content.chars().filter(c -> c == '\n').count() + 1;
        if (paragraphs >= 3) {
            score += 10;
        } else if (paragraphs >= 2) {
            score += 5;
        }

        // Readability - sentence variety (15%)
        String[] sentences = content.split("[.!?]+");
        if (sentences.length >= 5) {
            double avgSentenceLen = (double) wordCount / sentences.length;
            if (avgSentenceLen >= 10 && avgSentenceLen <= 20) {
                score += 15;
            } else if (avgSentenceLen >= 5 && avgSentenceLen <= 30) {
                score += 10;
            } else {
                score += 5;
            }
        } else if (sentences.length >= 2) {
            score += 7;
        }

        // Has links (10%)
        if (content.contains("http") || content.contains("href")) {
            score += 10;
        }

        // Has images (10%)
        if (content.contains("<img") || content.contains("![")) {
            score += 10;
        }

        // Keyword in title and content (15%)
        String[] titleWords = title.toLowerCase().split("\\s+");
        String contentLower = content.toLowerCase();
        int keywordMatches = 0;
        for (String word : titleWords) {
            if (word.length() > 3 && contentLower.contains(word)) {
                keywordMatches++;
            }
        }
        if (keywordMatches >= 3) {
            score += 15;
        } else if (keywordMatches >= 1) {
            score += 8;
        }

        return Math.min(score, 100); // Cap at 100
    }
}
