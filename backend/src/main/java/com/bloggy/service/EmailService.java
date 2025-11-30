package com.bloggy.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.bloggy.model.Blog;
import com.bloggy.repository.FollowRepository;

import java.util.List;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private FollowRepository followRepo;

    @Async("workerExecutor")
    public void sendNewBlogNotification(Blog blog) {
        List<String> followerEmails = followRepo.findFollowerEmailsByAuthorName(blog.getAuthor());
        
        if (followerEmails.isEmpty()) {
            System.out.println("No followers to notify for author: " + blog.getAuthor());
            return;
        }

        for (String email : followerEmails) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom("cloudykumar2004@gmail.com");
                message.setTo(email);
                message.setSubject("🖊️ New Blog from " + blog.getAuthor() + " on Bloggy!");
                message.setText(
                    "Hi there!\n\n" +
                    blog.getAuthor() + " just published a new blog post:\n\n" +
                    "📝 " + blog.getTitle() + "\n\n" +
                    blog.getContent().substring(0, Math.min(200, blog.getContent().length())) + "...\n\n" +
                    "Read more at: http://localhost:3000/blog/" + blog.getId() + "\n\n" +
                    "---\n" +
                    "You're receiving this because you follow " + blog.getAuthor() + " on Bloggy.\n" +
                    "Unfollow from your profile to stop receiving these emails."
                );
                
                mailSender.send(message);
                System.out.println("✉️ Email sent to: " + email);
            } catch (Exception e) {
                System.err.println("Failed to send email to " + email + ": " + e.getMessage());
            }
        }
    }

    public void sendWelcomeEmail(String toEmail, String name) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("cloudykumar2004@gmail.com");
            message.setTo(toEmail);
            message.setSubject("Welcome to Bloggy! 🎉");
            message.setText(
                "Hi " + name + "!\n\n" +
                "Welcome to Bloggy - your new home for blogging!\n\n" +
                "Here's what you can do:\n" +
                "✍️ Write and publish blog posts\n" +
                "👥 Follow your favorite authors\n" +
                "💬 Comment on posts\n" +
                "📧 Get notified when authors you follow post new content\n\n" +
                "Start exploring: http://localhost:3000\n\n" +
                "Happy blogging!\n" +
                "- The Bloggy Team"
            );
            
            mailSender.send(message);
            System.out.println("✉️ Welcome email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }
    }
}

