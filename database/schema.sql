CREATE DATABASE IF NOT EXISTS `mdva` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mdva`;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255),
  dob DATE NULL,
  gender VARCHAR(255) NULL,
  phone VARCHAR(255) NULL,
  address TEXT NULL,
  leave_balance INT(11) DEFAULT 0,
  salary INT(11) DEFAULT 0,
  profile_picture VARCHAR(255) NULL,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(255) DEFAULT 'user',
  status INT(11) DEFAULT 1 COMMENT '0: inactive, 1: active, 2: suspended',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS leave_request;
CREATE TABLE leave_request (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  start_date DATE,
  end_date DATE,
  reason TEXT,
  comment TEXT NULL,
  consume_balance INT(11) DEFAULT 0,
  log_balance TEXT NULL,
  status INT(11) DEFAULT 0 COMMENT '0: pending, 1: approved, 2: rejected, 3: canceled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (user_id)
);

DROP TABLE IF EXISTS inventory;
CREATE TABLE inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  quantity INT(11) DEFAULT 0,
  unit VARCHAR(255),
  status INT(11) DEFAULT 0 COMMENT '0: available, 1: not available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS inventory_request;
CREATE TABLE inventory_request (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  inventory_id INT,
  quantity INT(11) DEFAULT 0,
  status INT(11) DEFAULT 0 COMMENT '0: pending, 1: approved, 2: rejected, 3: canceled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (user_id),
  INDEX (inventory_id)
);

DROP TABLE IF EXISTS messages;
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  from_user_id INT,
  to_user_id INT,
  message TEXT,
  attachment VARCHAR(255) NULL,
  status INT(11) DEFAULT 0 COMMENT '0: pending, 1: read, 2: unread',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (from_user_id),
  INDEX (to_user_id)
);

DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  message TEXT,
  status INT(11) DEFAULT 0 COMMENT '0: pending, 1: read, 2: unread',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (user_id)
);

DROP TABLE IF EXISTS events;
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  image VARCHAR(255) NULL,
  start_date DATE,
  end_date DATE,
  status INT(11) DEFAULT 0 COMMENT '0: active, 1: inactive',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS log_access;
CREATE TABLE log_access (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  ip_address VARCHAR(255),
  user_agent VARCHAR(255),
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS settings;
CREATE TABLE settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(255),
  value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


