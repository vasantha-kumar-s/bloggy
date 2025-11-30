-- Initialize bloggy database
CREATE DATABASE IF NOT EXISTS bloggy;
USE bloggy;

-- Grant privileges
GRANT ALL PRIVILEGES ON bloggy.* TO 'bloggy'@'%';
FLUSH PRIVILEGES;

