package com.bloggy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.bloggy.repository")
@EntityScan(basePackages = "com.bloggy.model")
@ComponentScan(basePackages = "com.bloggy")
public class BloggyBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BloggyBackendApplication.class, args);
	}

}
