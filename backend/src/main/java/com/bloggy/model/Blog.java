package com.bloggy.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blogs")
public class Blog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String author;
    @Column(length = 10000)
    private String content;
    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;
    private String tags;
    private Double seoScore;
    private Double aiSimilarityScore;
    private Boolean profanityFound;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Blog() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public Double getSeoScore() { return seoScore; }
    public void setSeoScore(Double seoScore) { this.seoScore = seoScore; }
    public Double getAiSimilarityScore() { return aiSimilarityScore; }
    public void setAiSimilarityScore(Double aiSimilarityScore) { this.aiSimilarityScore = aiSimilarityScore; }
    public Boolean getProfanityFound() { return profanityFound; }
    public void setProfanityFound(Boolean profanityFound) { this.profanityFound = profanityFound; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

