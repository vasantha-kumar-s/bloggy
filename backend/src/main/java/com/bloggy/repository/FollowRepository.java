package com.bloggy.repository;

import com.bloggy.model.Follow;
import com.bloggy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    
    List<Follow> findByAuthorName(String authorName);
    
    List<Follow> findByFollower(User follower);
    
    Optional<Follow> findByFollowerAndAuthorName(User follower, String authorName);
    
    boolean existsByFollowerAndAuthorName(User follower, String authorName);
    
    void deleteByFollowerAndAuthorName(User follower, String authorName);
    
    @Query("SELECT f.follower.email FROM Follow f WHERE f.authorName = :authorName")
    List<String> findFollowerEmailsByAuthorName(String authorName);
    
    long countByAuthorName(String authorName);
}

