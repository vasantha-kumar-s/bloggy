package com.bloggy.repository;

import com.bloggy.model.Blog;
import com.bloggy.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {
    List<Blog> findAllByStatus(Status status);
    List<Blog> findByAuthor(String author);
}