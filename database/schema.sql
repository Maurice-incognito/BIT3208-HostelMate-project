-- ============================================================
--  HostelMate – Student Hostel Booking System
--  BIT3208 CAT 1 Database Schema
--  Run this entire file in phpMyAdmin → SQL tab
-- ============================================================

CREATE DATABASE IF NOT EXISTS hostelmate_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hostelmate_db;

-- ── Students (Users) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(150)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password      VARCHAR(255)  NOT NULL,
  admission_no  VARCHAR(50)   UNIQUE,
  phone         VARCHAR(20),
  course        VARCHAR(150),
  year_of_study TINYINT       DEFAULT 1,
  role          ENUM('student','admin') DEFAULT 'student',
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ── Hostels (Buildings) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS hostels (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  gender      ENUM('male','female','mixed') DEFAULT 'mixed',
  description TEXT,
  image_url   VARCHAR(500),
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ── Rooms ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
  id           INT            AUTO_INCREMENT PRIMARY KEY,
  hostel_id    INT            NOT NULL,
  room_number  VARCHAR(20)    NOT NULL,
  floor        TINYINT        DEFAULT 1,
  type         ENUM('single','double','triple','ensuite') NOT NULL,
  price_per_sem DECIMAL(10,2) NOT NULL,
  capacity     TINYINT        NOT NULL DEFAULT 1,
  occupied     TINYINT        NOT NULL DEFAULT 0,
  amenities    VARCHAR(500),
  image_url    VARCHAR(500),
  status       ENUM('available','fully_booked','maintenance') DEFAULT 'available',
  created_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
  UNIQUE KEY unique_room (hostel_id, room_number)
);

-- ── Bookings ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id              INT     AUTO_INCREMENT PRIMARY KEY,
  student_id      INT     NOT NULL,
  room_id         INT     NOT NULL,
  semester        VARCHAR(50) NOT NULL,
  academic_year   VARCHAR(20) NOT NULL,
  check_in_date   DATE    NOT NULL,
  check_out_date  DATE    NOT NULL,
  amount_due      DECIMAL(10,2) NOT NULL,
  payment_status  ENUM('pending','paid','partial') DEFAULT 'pending',
  booking_status  ENUM('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  notes           TEXT,
  booked_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id)    REFERENCES rooms(id)    ON DELETE CASCADE
);

-- ── Payments ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id          INT            AUTO_INCREMENT PRIMARY KEY,
  booking_id  INT            NOT NULL,
  student_id  INT            NOT NULL,
  amount      DECIMAL(10,2)  NOT NULL,
  method      ENUM('mpesa','bank','cash') DEFAULT 'mpesa',
  reference   VARCHAR(100),
  paid_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id)  REFERENCES bookings(id)  ON DELETE CASCADE,
  FOREIGN KEY (student_id)  REFERENCES students(id)  ON DELETE CASCADE
);

-- ── Seed: Admin account ──────────────────────────────────────
-- Password will be set by setup-admin.js (run after npm install)
INSERT IGNORE INTO students (full_name, email, password, admission_no, role)
VALUES ('Admin', 'admin@hostelmate.ac.ke', 'PLACEHOLDER', 'ADMIN001', 'admin');

-- ── Seed: Hostels ─────────────────────────────────────────────
INSERT IGNORE INTO hostels (id, name, gender, description, image_url) VALUES
(1, 'Kilimanjaro Block', 'male',   'Modern male hostel with 24/7 security and Wi-Fi on all floors.',
   'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600'),
(2, 'Serengeti Block',   'female', 'Female-only hostel with study rooms and laundry facilities.',
   'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600'),
(3, 'Nairobi Block',     'mixed',  'Mixed hostel close to the main library. Quiet study environment.',
   'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600');

-- ── Seed: Rooms ──────────────────────────────────────────────
INSERT IGNORE INTO rooms (hostel_id, room_number, floor, type, price_per_sem, capacity, occupied, amenities, image_url, status) VALUES
-- Kilimanjaro (male)
(1, 'K101', 1, 'single',  18000.00, 1, 0, 'Wi-Fi, Study desk, Wardrobe, Window',           'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500', 'available'),
(1, 'K102', 1, 'double',  12000.00, 2, 1, 'Wi-Fi, Study desk, Shared wardrobe',             'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', 'available'),
(1, 'K103', 1, 'triple',   9000.00, 3, 0, 'Wi-Fi, Bunk beds, Shared wardrobe',              'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500', 'available'),
(1, 'K201', 2, 'ensuite', 22000.00, 1, 0, 'Wi-Fi, En-suite bathroom, Study desk, Wardrobe, AC', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500', 'available'),
(1, 'K202', 2, 'double',  12000.00, 2, 2, 'Wi-Fi, Study desk, Shared wardrobe',             'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', 'fully_booked'),
(1, 'K301', 3, 'single',  18000.00, 1, 0, 'Wi-Fi, Study desk, Wardrobe, City view',         'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500', 'maintenance'),
-- Serengeti (female)
(2, 'S101', 1, 'single',  17500.00, 1, 0, 'Wi-Fi, Study desk, Wardrobe, Dressing mirror',   'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500', 'available'),
(2, 'S102', 1, 'double',  11500.00, 2, 0, 'Wi-Fi, Study desk, Shared wardrobe',             'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', 'available'),
(2, 'S201', 2, 'ensuite', 21000.00, 1, 0, 'Wi-Fi, En-suite bathroom, Study desk, Wardrobe', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500', 'available'),
(2, 'S202', 2, 'triple',   8500.00, 3, 3, 'Wi-Fi, Bunk beds, Shared wardrobe',              'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500', 'fully_booked'),
-- Nairobi (mixed)
(3, 'N101', 1, 'single',  16000.00, 1, 0, 'Wi-Fi, Study desk, Wardrobe',                   'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500', 'available'),
(3, 'N102', 1, 'double',  11000.00, 2, 1, 'Wi-Fi, Study desk, Shared wardrobe',             'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', 'available'),
(3, 'N201', 2, 'ensuite', 20000.00, 1, 0, 'Wi-Fi, En-suite bathroom, Study desk, Wardrobe, Balcony', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500', 'available'),
(3, 'N301', 3, 'triple',   8000.00, 3, 0, 'Wi-Fi, Bunk beds, Study area',                  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500', 'available');
