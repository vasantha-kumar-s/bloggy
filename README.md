# Bloggy

A modern blog platform with smart content moderation, auto-tagging, and SEO scoring.

## Tech Stack

- **Backend:** Spring Boot 3.4, Java 21, MySQL, Redis
- **Frontend:** Next.js 14, TypeScript, React
- **DevOps:** Docker, Docker Compose

## Features

- Content moderation with profanity detection
- TF-IDF based auto-tagging
- SEO scoring system
- User authentication and profiles
- Follow authors and email notifications
- Search and sort posts
- Admin moderation dashboard

## Quick Start

### Option 1: Using Docker (Recommended)

Start MySQL and Redis containers:
```bash
cd docker
docker-compose up -d
```

Then run backend and frontend:
```bash
# Terminal 1 - Backend
cd backend
./mvnw spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### Option 2: Manual Setup

Prerequisites: Java 21, Node.js 18+, MySQL 8

```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm run dev
```

## Configuration

### Backend (application.properties)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bloggy
spring.datasource.username=root
spring.datasource.password=yourpassword
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

## Docker Services

| Service | Port | Description |
|---------|------|-------------|
| MySQL | 3306 | Database |
| Redis | 6379 | Caching |

## Documentation

See [PROJECT_INFO.md](PROJECT_INFO.md) for detailed documentation.

## License

MIT
