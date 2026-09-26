-- PostgreSQL Schema

CREATE TABLE IF NOT EXISTS users (
  ID SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher', 'viewer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  ID SERIAL PRIMARY KEY,
  "Name" VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  "class" VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  ID SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL UNIQUE,
  "code" VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  "instructor" VARCHAR(255),
  credits INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enrollments (
  ID SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(ID) ON DELETE CASCADE,
  course_id INT NOT NULL REFERENCES courses(ID) ON DELETE CASCADE,
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_id, course_id)
);
CREATE INDEX idx_student ON enrollments(student_id);
CREATE INDEX idx_course ON enrollments(course_id);

CREATE TABLE IF NOT EXISTS grades (
  ID SERIAL PRIMARY KEY,
  enrollment_id INT NOT NULL UNIQUE REFERENCES enrollments(ID) ON DELETE CASCADE,
  midterm_score DECIMAL(5,2),
  final_score DECIMAL(5,2),
  letter_grade VARCHAR(2),
  attendance_percentage DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teachers (
  ID SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(ID) ON DELETE SET NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  department VARCHAR(100),
  subjects_taught VARCHAR(500),
  hire_date DATE,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  ID SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(ID) ON DELETE CASCADE,
  course_id INT NOT NULL REFERENCES courses(ID) ON DELETE CASCADE,
  "date" DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  remarks VARCHAR(500),
  marked_by INT REFERENCES users(ID) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_id, course_id, "date")
);
CREATE INDEX idx_student_date ON attendance(student_id, "date");
CREATE INDEX idx_course_date ON attendance(course_id, "date");

CREATE TABLE IF NOT EXISTS announcements (
  ID SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id INT NOT NULL REFERENCES users(ID) ON DELETE CASCADE,
  category VARCHAR(20) DEFAULT 'general' CHECK (category IN ('general', 'academic', 'event', 'urgent')),
  target_role VARCHAR(20) DEFAULT 'all' CHECK (target_role IN ('all', 'teacher', 'viewer')),
  pinned SMALLINT DEFAULT 0,
  expires_at DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_created ON announcements(created_at);
