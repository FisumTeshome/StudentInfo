-- Schema for users table (admin/teacher role)
CREATE TABLE IF NOT EXISTS users (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'teacher', 'viewer') DEFAULT 'teacher',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Schema for students table
CREATE TABLE IF NOT EXISTS students (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  `Name` VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  `class` VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Schema for courses table
CREATE TABLE IF NOT EXISTS courses (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  `instructor` VARCHAR(255),
  credits INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Schema for enrollments (many-to-many students <-> courses)
CREATE TABLE IF NOT EXISTS enrollments (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_enrollment (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(ID) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(ID) ON DELETE CASCADE,
  INDEX idx_student (student_id),
  INDEX idx_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Schema for grades table
CREATE TABLE IF NOT EXISTS grades (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  enrollment_id INT NOT NULL UNIQUE,
  midterm_score DECIMAL(5,2),
  final_score DECIMAL(5,2),
  letter_grade VARCHAR(2),
  attendance_percentage DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(ID) ON DELETE CASCADE,
  INDEX idx_enrollment (enrollment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- NEW MODULE TABLES
-- ============================================================

-- Teachers table (first-class staff records)
CREATE TABLE IF NOT EXISTS teachers (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  department VARCHAR(100),
  subjects_taught VARCHAR(500),
  hire_date DATE,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(ID) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Attendance records (daily per student per course)
CREATE TABLE IF NOT EXISTS attendance (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  `date` DATE NOT NULL,
  status ENUM('present', 'absent', 'late') DEFAULT 'present',
  remarks VARCHAR(500),
  marked_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_attendance (student_id, course_id, `date`),
  FOREIGN KEY (student_id) REFERENCES students(ID) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(ID) ON DELETE CASCADE,
  FOREIGN KEY (marked_by) REFERENCES users(ID) ON DELETE SET NULL,
  INDEX idx_student_date (student_id, `date`),
  INDEX idx_course_date (course_id, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Announcements board
CREATE TABLE IF NOT EXISTS announcements (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id INT NOT NULL,
  category ENUM('general', 'academic', 'event', 'urgent') DEFAULT 'general',
  target_role ENUM('all', 'teacher', 'viewer') DEFAULT 'all',
  pinned TINYINT(1) DEFAULT 0,
  expires_at DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(ID) ON DELETE CASCADE,
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
